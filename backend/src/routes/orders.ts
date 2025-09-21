import express, { Request, Response } from 'express';
import { OrderModel, CreateOrderData } from '../models/Order';
import { authenticateToken, requireAdmin, requireCustomer, AuthRequest } from '../middleware/auth';
import { validateOrder, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// Create order
router.post('/', authenticateToken, requireCustomer, validateOrder, handleValidationErrors, async (req: AuthRequest<CreateOrderData>, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const body = (req as Request).body as CreateOrderData;
    const orderData: CreateOrderData = {
      ...body,
      user_id: req.user.id
    };

    const order = await OrderModel.create(orderData);
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user orders
router.get('/my-orders', authenticateToken, requireCustomer, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const { limit = 50, offset = 0 } = req.query;
    const orders = await OrderModel.findByUser(
      req.user.id,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const { id } = req.params;
    const orderWithItems = await OrderModel.getOrderWithItems(id);

    if (!orderWithItems) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user has permission to view this order
    if (req.user!.role !== 'admin' && orderWithItems.order.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    res.json(orderWithItems);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all orders (admin only)
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      status,
      payment_status,
      limit = 50,
      offset = 0
    } = req.query;

    const filters = {
      status: status as string,
      payment_status: payment_status as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };

    const result = await OrderModel.getAll(filters);
    res.json(result);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, estimated_delivery, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (tracking_number) updateData.tracking_number = tracking_number;
    if (estimated_delivery) updateData.estimated_delivery = estimated_delivery;
    if (notes) updateData.notes = notes;

    if (status === 'delivered') {
      updateData.delivered_at = new Date();
    }

    const order = await OrderModel.update(id, updateData);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment status (admin only)
router.patch('/:id/payment', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_intent_id } = req.body;

    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const updateData: any = { payment_status };
    if (payment_intent_id) updateData.payment_intent_id = payment_intent_id;

    const order = await OrderModel.update(id, updateData);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order statistics (admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await OrderModel.getOrderStats();
    res.json(stats);
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent orders (admin only)
router.get('/recent/list', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const orders = await OrderModel.getRecentOrders(parseInt(limit as string));
    res.json(orders);
  } catch (error) {
    console.error('Get recent orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel order
router.patch('/:id/cancel', authenticateToken, requireCustomer, async (req: AuthRequest<{ reason?: string }>, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const { id } = req.params;
    const { reason } = (req as Request).body as { reason?: string };

    // Check if order exists and belongs to user
    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Only allow cancellation if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }

    const updateData = {
      status: 'cancelled' as const,
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled by customer'
    };

    const updatedOrder = await OrderModel.update(id, updateData);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
