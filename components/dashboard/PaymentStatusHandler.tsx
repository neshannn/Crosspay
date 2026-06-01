'use client';

import { useEffect } from 'react';
import { useSearchParams } from "next/navigation";
import { useToast } from '../ui/Toast';

export default function PaymentStatusHandler() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const status = searchParams.get('status');
  const message = searchParams.get('message');

  useEffect(() => {
    if (status === 'success') {
      showToast("Payment successful! Your digital key has been sent to your email.", "success");
    } else if (status === 'failure') {
      showToast("Payment failed or was cancelled. Please try again.", "error");
    } else if (status === 'error') {
      showToast(message || "An error occurred during payment.", "error");
    }

    // Clean up URL if needed (optional)
    if (status) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [status, message, showToast]);

  return null;
}
