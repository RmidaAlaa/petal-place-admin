import React, { createContext, useContext, ReactNode } from 'react';
import emailService, { 
  OrderConfirmationData, 
  PasswordResetData, 
  WelcomeData, 
  OrderStatusUpdateData, 
  AbandonedCartData, 
  ReviewRequestData, 
  BirthdayDiscountData 
} from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';

export interface EmailContextType {
  sendOrderConfirmation: (data: OrderConfirmationData) => Promise<boolean>;
  sendPasswordReset: (data: PasswordResetData) => Promise<boolean>;
  sendWelcomeEmail: (data: WelcomeData) => Promise<boolean>;
  sendOrderStatusUpdate: (data: OrderStatusUpdateData) => Promise<boolean>;
  sendAbandonedCartReminder: (data: AbandonedCartData) => Promise<boolean>;
  sendReviewRequest: (data: ReviewRequestData) => Promise<boolean>;
  sendBirthdayDiscount: (data: BirthdayDiscountData) => Promise<boolean>;
  sendBulkEmails: (emails: Array<{ type: string; data: any }>) => Promise<{ success: number; failed: number }>;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const EmailProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  const handleEmailResult = (success: boolean, type: string) => {
    if (success) {
      toast({
        title: 'Email Sent',
        description: `${type} email sent successfully`,
      });
    } else {
      toast({
        title: 'Email Failed',
        description: `Failed to send ${type} email`,
        variant: 'destructive',
      });
    }
  };

  const sendOrderConfirmation = async (data: OrderConfirmationData): Promise<boolean> => {
    try {
      const success = await emailService.sendOrderConfirmation(data);
      handleEmailResult(success, 'Order Confirmation');
      return success;
    } catch (error) {
      console.error('Order confirmation email failed:', error);
      handleEmailResult(false, 'Order Confirmation');
      return false;
    }
  };

  const sendPasswordReset = async (data: PasswordResetData): Promise<boolean> => {
    try {
      const success = await emailService.sendPasswordReset(data);
      handleEmailResult(success, 'Password Reset');
      return success;
    } catch (error) {
      console.error('Password reset email failed:', error);
      handleEmailResult(false, 'Password Reset');
      return false;
    }
  };

  const sendWelcomeEmail = async (data: WelcomeData): Promise<boolean> => {
    try {
      const success = await emailService.sendWelcomeEmail(data);
      handleEmailResult(success, 'Welcome');
      return success;
    } catch (error) {
      console.error('Welcome email failed:', error);
      handleEmailResult(false, 'Welcome');
      return false;
    }
  };

  const sendOrderStatusUpdate = async (data: OrderStatusUpdateData): Promise<boolean> => {
    try {
      const success = await emailService.sendOrderStatusUpdate(data);
      handleEmailResult(success, 'Order Status Update');
      return success;
    } catch (error) {
      console.error('Order status update email failed:', error);
      handleEmailResult(false, 'Order Status Update');
      return false;
    }
  };

  const sendAbandonedCartReminder = async (data: AbandonedCartData): Promise<boolean> => {
    try {
      const success = await emailService.sendAbandonedCartReminder(data);
      handleEmailResult(success, 'Abandoned Cart Reminder');
      return success;
    } catch (error) {
      console.error('Abandoned cart email failed:', error);
      handleEmailResult(false, 'Abandoned Cart Reminder');
      return false;
    }
  };

  const sendReviewRequest = async (data: ReviewRequestData): Promise<boolean> => {
    try {
      const success = await emailService.sendReviewRequest(data);
      handleEmailResult(success, 'Review Request');
      return success;
    } catch (error) {
      console.error('Review request email failed:', error);
      handleEmailResult(false, 'Review Request');
      return false;
    }
  };

  const sendBirthdayDiscount = async (data: BirthdayDiscountData): Promise<boolean> => {
    try {
      const success = await emailService.sendBirthdayDiscount(data);
      handleEmailResult(success, 'Birthday Discount');
      return success;
    } catch (error) {
      console.error('Birthday discount email failed:', error);
      handleEmailResult(false, 'Birthday Discount');
      return false;
    }
  };

  const sendBulkEmails = async (emails: Array<{ type: string; data: any }>): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        let result = false;
        
        switch (email.type) {
          case 'orderConfirmation':
            result = await emailService.sendOrderConfirmation(email.data);
            break;
          case 'passwordReset':
            result = await emailService.sendPasswordReset(email.data);
            break;
          case 'welcome':
            result = await emailService.sendWelcomeEmail(email.data);
            break;
          case 'orderStatusUpdate':
            result = await emailService.sendOrderStatusUpdate(email.data);
            break;
          case 'abandonedCart':
            result = await emailService.sendAbandonedCartReminder(email.data);
            break;
          case 'reviewRequest':
            result = await emailService.sendReviewRequest(email.data);
            break;
          case 'birthdayDiscount':
            result = await emailService.sendBirthdayDiscount(email.data);
            break;
          default:
            console.warn(`Unknown email type: ${email.type}`);
            failed++;
            continue;
        }

        if (result) {
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Bulk email failed for type ${email.type}:`, error);
        failed++;
      }
    }

    toast({
      title: 'Bulk Email Complete',
      description: `Sent ${success} emails successfully, ${failed} failed`,
    });

    return { success, failed };
  };

  const value: EmailContextType = {
    sendOrderConfirmation,
    sendPasswordReset,
    sendWelcomeEmail,
    sendOrderStatusUpdate,
    sendAbandonedCartReminder,
    sendReviewRequest,
    sendBirthdayDiscount,
    sendBulkEmails,
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};
