/**
 * SubFlow JavaScript SDK
 * Embed payment checkout on any website
 * 
 * Usage:
 * <script src="https://your-subflow-app.com/sdk/subflow.js"></script>
 * <script>
 *   const subflow = new SubFlow('pk_live_xxx');
 *   subflow.checkout({
 *     priceId: 'price-uuid',
 *     customerPhone: '+211912345678',
 *     onSuccess: (data) => console.log('Payment successful', data),
 *     onCancel: () => console.log('Payment cancelled'),
 *   });
 * </script>
 */

(function(window) {
  'use strict';

  const SUBFLOW_API_BASE = window.SUBFLOW_API_BASE || '';

  class SubFlow {
    constructor(publicKey) {
      if (!publicKey || !publicKey.startsWith('pk_')) {
        throw new Error('Invalid public key. Use your public key (pk_...)');
      }
      this.publicKey = publicKey;
      this.modal = null;
    }

    // Create checkout session and open modal/redirect
    async checkout(options = {}) {
      const {
        priceId,
        customerPhone,
        customerEmail,
        successUrl,
        cancelUrl,
        mode = 'modal', // 'modal' | 'redirect'
        onSuccess,
        onCancel,
        onError,
      } = options;

      if (!priceId) {
        throw new Error('priceId is required');
      }
      if (!customerPhone) {
        throw new Error('customerPhone is required');
      }

      try {
        // For modal mode, we open the checkout in an iframe
        if (mode === 'modal') {
          this._openModal(priceId, customerPhone, customerEmail, onSuccess, onCancel, onError);
        } else {
          // For redirect mode, redirect to checkout page
          const checkoutUrl = `${SUBFLOW_API_BASE}/checkout-redirect?` + 
            `price_id=${encodeURIComponent(priceId)}` +
            `&customer_phone=${encodeURIComponent(customerPhone)}` +
            (customerEmail ? `&customer_email=${encodeURIComponent(customerEmail)}` : '') +
            (successUrl ? `&success_url=${encodeURIComponent(successUrl)}` : '') +
            (cancelUrl ? `&cancel_url=${encodeURIComponent(cancelUrl)}` : '');
          
          window.location.href = checkoutUrl;
        }
      } catch (error) {
        if (onError) {
          onError(error);
        } else {
          throw error;
        }
      }
    }

    // Open checkout modal
    _openModal(priceId, customerPhone, customerEmail, onSuccess, onCancel, onError) {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.id = 'subflow-modal-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: subflow-fade-in 0.2s ease;
      `;

      // Create modal container
      const modal = document.createElement('div');
      modal.id = 'subflow-modal';
      modal.style.cssText = `
        background: white;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        animation: subflow-slide-up 0.3s ease;
      `;

      // Create header
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e5e7eb;
      `;
      header.innerHTML = `
        <span style="font-weight: 600; color: #111827;">Complete Payment</span>
        <button id="subflow-close-btn" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          line-height: 1;
        ">&times;</button>
      `;

      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.id = 'subflow-checkout-frame';
      const checkoutUrl = `${SUBFLOW_API_BASE}/checkout-embed?` +
        `price_id=${encodeURIComponent(priceId)}` +
        `&customer_phone=${encodeURIComponent(customerPhone)}` +
        (customerEmail ? `&customer_email=${encodeURIComponent(customerEmail)}` : '');
      
      iframe.src = checkoutUrl;
      iframe.style.cssText = `
        width: 100%;
        height: 500px;
        border: none;
      `;

      // Add styles
      const style = document.createElement('style');
      style.textContent = `
        @keyframes subflow-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes subflow-slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;

      // Assemble modal
      modal.appendChild(header);
      modal.appendChild(iframe);
      overlay.appendChild(modal);
      document.head.appendChild(style);
      document.body.appendChild(overlay);

      // Store reference
      this.modal = overlay;

      // Handle close
      const closeModal = () => {
        if (this.modal) {
          this.modal.remove();
          this.modal = null;
          if (onCancel) onCancel();
        }
      };

      overlay.querySelector('#subflow-close-btn').addEventListener('click', closeModal);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });

      // Listen for messages from iframe
      window.addEventListener('message', (event) => {
        if (event.data.type === 'subflow:success') {
          this.modal?.remove();
          this.modal = null;
          if (onSuccess) onSuccess(event.data.data);
        } else if (event.data.type === 'subflow:cancel') {
          closeModal();
        } else if (event.data.type === 'subflow:error') {
          this.modal?.remove();
          this.modal = null;
          if (onError) onError(event.data.error);
        }
      });
    }

    // Close modal programmatically
    closeModal() {
      if (this.modal) {
        this.modal.remove();
        this.modal = null;
      }
    }

    // Check subscription access (requires secret key - use on server only!)
    static async checkAccess(secretKey, productId, customerPhone) {
      const response = await fetch(`${SUBFLOW_API_BASE}/api/v1/access/check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          customer_phone: customerPhone,
        }),
      });
      return response.json();
    }
  }

  // Expose to window
  window.SubFlow = SubFlow;

})(window);
