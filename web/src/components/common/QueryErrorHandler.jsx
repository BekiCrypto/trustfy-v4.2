import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function QueryErrorHandler({ error, retry, title = "Failed to load data" }) {
  const getErrorMessage = (error) => {
    if (!error) return "An unknown error occurred";
    if (error.message) return error.message;
    if (typeof error === 'string') return error;
    return "Something went wrong. Please try again.";
  };

  return (
    <Alert className="bg-red-500/10 border-red-500/30">
      <AlertTriangle className="h-4 w-4 text-red-400" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="text-red-300 font-medium">{title}</p>
          <p className="text-red-400 text-sm mt-1">{getErrorMessage(error)}</p>
        </div>
        {retry && (
          <Button
            onClick={retry}
            size="sm"
            variant="outline"
            className="border-red-500/50 text-red-300 hover:bg-red-500/10"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}