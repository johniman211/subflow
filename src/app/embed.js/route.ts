import { NextRequest, NextResponse } from 'next/server';

// GET /embed.js - Returns the Losetify embed script
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.losetify.com';

  const script = `
(function() {
  'use strict';

  // Losetify Embed SDK
  window.Losetify = window.Losetify || {};

  // Configuration
  Losetify.config = {
    baseUrl: '${baseUrl}',
    version: '1.0.0'
  };

  // Styles for the checkout modal
  const styles = \`
    .losetify-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
    }
    .losetify-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .losetify-modal {
      background: white;
      border-radius: 16px;
      width: 95%;
      max-width: 500px;
      max-height: 90vh;
      overflow: hidden;
      transform: translateY(20px);
      transition: transform 0.3s;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    .losetify-overlay.active .losetify-modal {
      transform: translateY(0);
    }
    .losetify-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .losetify-title {
      font-weight: 600;
      font-size: 18px;
      color: #111827;
    }
    .losetify-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      line-height: 1;
    }
    .losetify-close:hover {
      color: #111827;
    }
    .losetify-iframe {
      width: 100%;
      height: 600px;
      border: none;
    }
    .losetify-powered {
      padding: 12px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      background: #f9fafb;
    }
    .losetify-powered a {
      color: #6b7280;
      text-decoration: none;
    }
    .losetify-powered a:hover {
      color: #111827;
    }
    .losetify-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 24px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .losetify-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
    .losetify-inline {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
  \`;

  // Inject styles
  function injectStyles() {
    if (document.getElementById('losetify-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'losetify-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // Create modal overlay
  function createModal() {
    if (document.getElementById('losetify-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'losetify-overlay';
    overlay.className = 'losetify-overlay';
    overlay.innerHTML = \`
      <div class="losetify-modal">
        <div class="losetify-header">
          <span class="losetify-title">Complete Payment</span>
          <button class="losetify-close" onclick="Losetify.close()">&times;</button>
        </div>
        <iframe id="losetify-iframe" class="losetify-iframe"></iframe>
        <div class="losetify-powered">
          Secured by <a href="https://www.losetify.com" target="_blank">Losetify</a>
        </div>
      </div>
    \`;
    
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) Losetify.close();
    });
    
    document.body.appendChild(overlay);
  }

  // Open checkout in modal
  Losetify.checkout = function(options) {
    if (!options.productId && !options.priceId) {
      console.error('Losetify: productId or priceId is required');
      return;
    }

    injectStyles();
    createModal();

    const overlay = document.getElementById('losetify-overlay');
    const iframe = document.getElementById('losetify-iframe');
    
    let checkoutUrl = Losetify.config.baseUrl + '/checkout/' + options.productId;
    if (options.priceId) {
      checkoutUrl += '?price=' + options.priceId;
    }
    
    iframe.src = checkoutUrl;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Listen for messages from iframe
    window.addEventListener('message', function(event) {
      if (event.origin !== Losetify.config.baseUrl) return;
      
      if (event.data.type === 'losetify:payment:success') {
        if (options.onSuccess) options.onSuccess(event.data.payment);
        Losetify.close();
      }
      if (event.data.type === 'losetify:payment:error') {
        if (options.onError) options.onError(event.data.error);
      }
      if (event.data.type === 'losetify:close') {
        Losetify.close();
      }
    });
  };

  // Close modal
  Losetify.close = function() {
    const overlay = document.getElementById('losetify-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      const iframe = document.getElementById('losetify-iframe');
      if (iframe) iframe.src = '';
    }
  };

  // Inline embed
  Losetify.embed = function(options) {
    if (!options.container) {
      console.error('Losetify: container is required');
      return;
    }
    if (!options.productId) {
      console.error('Losetify: productId is required');
      return;
    }

    injectStyles();

    const container = typeof options.container === 'string' 
      ? document.querySelector(options.container) 
      : options.container;

    if (!container) {
      console.error('Losetify: container element not found');
      return;
    }

    let checkoutUrl = Losetify.config.baseUrl + '/checkout/' + options.productId + '?embed=true';
    if (options.priceId) {
      checkoutUrl += '&price=' + options.priceId;
    }

    container.innerHTML = \`
      <div class="losetify-inline">
        <iframe src="\${checkoutUrl}" class="losetify-iframe" style="height: \${options.height || '650px'}"></iframe>
      </div>
    \`;

    // Listen for messages from iframe
    window.addEventListener('message', function(event) {
      if (event.origin !== Losetify.config.baseUrl) return;
      
      if (event.data.type === 'losetify:payment:success') {
        if (options.onSuccess) options.onSuccess(event.data.payment);
      }
      if (event.data.type === 'losetify:payment:error') {
        if (options.onError) options.onError(event.data.error);
      }
    });
  };

  // Create payment button
  Losetify.button = function(options) {
    if (!options.container) {
      console.error('Losetify: container is required');
      return;
    }

    injectStyles();

    const container = typeof options.container === 'string' 
      ? document.querySelector(options.container) 
      : options.container;

    if (!container) {
      console.error('Losetify: container element not found');
      return;
    }

    const btn = document.createElement('button');
    btn.className = 'losetify-btn';
    btn.textContent = options.text || 'Pay Now';
    btn.style.cssText = options.style || '';
    
    btn.addEventListener('click', function() {
      Losetify.checkout({
        productId: options.productId,
        priceId: options.priceId,
        onSuccess: options.onSuccess,
        onError: options.onError
      });
    });

    container.appendChild(btn);
  };

  // Auto-initialize buttons with data attributes
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-losetify-product]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        Losetify.checkout({
          productId: el.getAttribute('data-losetify-product'),
          priceId: el.getAttribute('data-losetify-price')
        });
      });
    });
  });

  console.log('Losetify SDK v' + Losetify.config.version + ' loaded');
})();
`;

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
