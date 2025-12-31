import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ImportProducts = () => {
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Redirect if not admin
  if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You need admin privileges to access this page.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setImportResult(null);
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please select a CSV file.',
          variant: 'destructive',
        });
      }
    }
  };

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const rows: Record<string, string>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
    
    return rows;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No File Selected',
        description: 'Please select a CSV file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      let imported = 0;
      let errors = 0;
      const errorDetails: string[] = [];

      for (const row of rows) {
        try {
          if (!row.name || !row.price || !row.category) {
            errorDetails.push(`Missing required fields for: ${row.name || 'unnamed product'}`);
            errors++;
            continue;
          }

          const productData = {
            name: row.name,
            price: parseFloat(row.price),
            category: row.category,
            description: row.description || null,
            original_price: row.original_price ? parseFloat(row.original_price) : null,
            stock_quantity: row.stock_quantity ? parseInt(row.stock_quantity) : 10,
            images: row.image_url ? [row.image_url] : [],
            is_featured: row.is_featured === 'true',
            is_new: row.is_new === 'true',
            is_active: true,
          };

          const { error } = await supabase.from('products').insert(productData);
          if (error) throw error;
          imported++;
        } catch (err: any) {
          errorDetails.push(`Error importing ${row.name}: ${err.message}`);
          errors++;
        }
      }

      setImportResult({ imported, errors, errorDetails });
      toast({
        title: 'Import Completed',
        description: `Imported ${imported} products with ${errors} errors.`,
      });
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import products.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `name,price,category,description,original_price,stock_quantity,image_url,is_featured,is_new
"Red Rose Bouquet",45.00,"Natural Roses","Beautiful red roses arrangement",55.00,25,"https://example.com/rose.jpg",true,false
"White Lily Set",35.00,"Premium Flowers","Elegant white lilies",40.00,15,"https://example.com/lily.jpg",false,true`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: 'Template Downloaded',
      description: 'CSV template has been downloaded successfully.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Import Products</h1>
            <p className="text-muted-foreground mt-2">
              Import products from Instagram or other sources using CSV format
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload CSV File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-file">Select CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>

                {file && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!file || isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload & Import
                      </>
                    )}
                  </Button>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing...</span>
                      <span>Please wait</span>
                    </div>
                    <Progress value={undefined} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  CSV Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download our CSV template to see the required format for importing products.
                  The template includes all necessary fields and examples.
                </p>

                <Button 
                  onClick={downloadTemplate}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Required Fields:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• name - Product name</li>
                    <li>• price - Product price</li>
                    <li>• category - Product category</li>
                    <li>• image_url - Main product image</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Optional Fields:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• description - Product description</li>
                    <li>• original_price - Original price for discounts</li>
                    <li>• vendor - Vendor name</li>
                    <li>• stock_quantity - Available stock</li>
                    <li>• is_featured - Mark as featured product</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Import Results */}
          {importResult && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {importResult.errors > 0 ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  Import Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                    <div className="text-sm text-green-700">Products Imported</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{importResult.errors}</div>
                    <div className="text-sm text-red-700">Errors</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {importResult.imported + importResult.errors}
                    </div>
                    <div className="text-sm text-blue-700">Total Processed</div>
                  </div>
                </div>

                {importResult.errorDetails && importResult.errorDetails.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Import Errors:</p>
                        <ul className="text-sm space-y-1">
                          {importResult.errorDetails.slice(0, 5).map((error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {importResult.errorDetails.length > 5 && (
                            <li>• ... and {importResult.errorDetails.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ImportProducts;
