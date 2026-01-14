import { NextRequest, NextResponse } from 'next/server';

// GET /embed.js - Returns the Payssd embed script
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.payssd.com';

  const script = `
(function() {
  'use strict';

  // Payssd Embed SDK
  window.Payssd = window.Payssd || {};

  // Configuration
  Payssd.config = {
    baseUrl: '${baseUrl}',
    version: '1.0.0'
  };

  // Styles for the checkout modal
  const styles = \`
    .payssd-overlay {
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
    .payssd-overlay.active {
      opacity: 1;
      visibility: visible;
    }
    .payssd-modal {
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
    .payssd-overlay.active .payssd-modal {
      transform: translateY(0);
    }
    .payssd-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .payssd-title {
      font-weight: 600;
      font-size: 18px;
      color: #111827;
    }
    .payssd-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      line-height: 1;
    }
    .payssd-close:hover {
      color: #111827;
    }
    .payssd-iframe {
      width: 100%;
      height: 600px;
      border: none;
    }
    .payssd-powered {
      padding: 12px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      background: #f9fafb;
    }
    .payssd-powered a {
      color: #6b7280;
      text-decoration: none;
    }
    .payssd-powered a:hover {
      color: #111827;
    }
    .payssd-btn {
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
    .payssd-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
    .payssd-inline {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
  \`;

  // Inject styles
  function injectStyles() {
    if (document.getElementById('payssd-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'payssd-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // Create modal overlay
  function createModal() {
    if (document.getElementById('payssd-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'payssd-overlay';
    overlay.className = 'payssd-overlay';
    overlay.innerHTML = \`
      <div class="payssd-modal">
        <div class="payssd-header">
          <span class="payssd-title">Complete Payment</span>
          <button class="payssd-close" onclick="Payssd.close()">&times;</button>
        </div>
        <iframe id="payssd-iframe" class="payssd-iframe"></iframe>
        <div class="payssd-powered">
          Secured by <a href="https://www.payssd.com" target="_blank">Payssd</a>
        </div>
      </div>
    \`;
    
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) Payssd.close();
    });
    
    document.body.appendChild(overlay);
  }

  // Open checkout in modal
  Payssd.checkout = function(options) {
    if (!options.productId && !options.priceId) {
      console.error('Payssd: productId or priceId is required');
      return;
    }

    injectStyles();
    createModal();

    const overlay = document.getElementById('payssd-overlay');
    const iframe = document.getElementById('payssd-iframe');
    
    let checkoutUrl = Payssd.config.baseUrl + '/checkout/' + options.productId;
    if (options.priceId) {
      checkoutUrl += '?price=' + options.priceId;
    }
    
    iframe.src = checkoutUrl;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Listen for messages from iframe
    window.addEventListener('message', function(event) {
      if (event.origin !== Payssd.config.baseUrl) return;
      
      if (event.data.type === 'payssd:payment:success') {
        if (options.onSuccess) options.onSuccess(event.data.payment);
        Payssd.close();
      }
      if (event.data.type === 'payssd:payment:error') {
        if (options.onError) options.onError(event.data.error);
      }
      if (event.data.type === 'payssd:close') {
        Payssd.close();
      }
    });
  };

  // Close modal
  Payssd.close = function() {
    const overlay = document.getElementById('payssd-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      const iframe = document.getElementById('payssd-iframe');
      if (iframe) iframe.src = '';
    }
  };

  // Inline embed
  Payssd.embed = function(options) {
    if (!options.container) {
      console.error('Payssd: container is required');
      return;
    }
    if (!options.productId) {
      console.error('Payssd: productId is required');
      return;
    }

    injectStyles();

    const container = typeof options.container === 'string' 
      ? document.querySelector(options.container) 
      : options.container;

    if (!container) {
      console.error('Payssd: container element not found');
      return;
    }

    let checkoutUrl = Payssd.config.baseUrl + '/checkout/' + options.productId + '?embed=true';
    if (options.priceId) {
      checkoutUrl += '&price=' + options.priceId;
    }

    container.innerHTML = \`
      <div class="payssd-inline">
        <iframe src="\${checkoutUrl}" class="payssd-iframe" style="height: \${options.height || '650px'}"></iframe>
      </div>
    \`;

    // Listen for messages from iframe
    window.addEventListener('message', function(event) {
      if (event.origin !== Payssd.config.baseUrl) return;
      
      if (event.data.type === 'payssd:payment:success') {
        if (options.onSuccess) options.onSuccess(event.data.payment);
      }
      if (event.data.type === 'payssd:payment:error') {
        if (options.onError) options.onError(event.data.error);
      }
    });
  };

  // Create payment button
  Payssd.button = function(options) {
    if (!options.container) {
      console.error('Payssd: container is required');
      return;
    }

    injectStyles();

    const container = typeof options.container === 'string' 
      ? document.querySelector(options.container) 
      : options.container;

    if (!container) {
      console.error('Payssd: container element not found');
      return;
    }

    const btn = document.createElement('button');
    btn.className = 'payssd-btn';
    btn.textContent = options.text || 'Pay Now';
    btn.style.cssText = options.style || '';
    
    btn.addEventListener('click', function() {
      Payssd.checkout({
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
    document.querySelectorAll('[data-payssd-product]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        Payssd.checkout({
          productId: el.getAttribute('data-payssd-product'),
          priceId: el.getAttribute('data-payssd-price')
        });
      });
    });
  });

  console.log('Payssd SDK v' + Payssd.config.version + ' loaded');
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
