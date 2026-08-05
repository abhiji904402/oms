import { Order } from '../types';

export function printThermalReceipts(orders: Order[]) {
  if (!orders || orders.length === 0) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to enable thermal receipt printing.');
    return;
  }

  const receiptHtml = orders
    .map(
      (o) => `
    <div class="receipt">
      <div class="center header-title">BROOMIES BAKERY</div>
      <div class="center sub-title">Fresh Baked Handcrafted Delights</div>
      <div class="divider">--------------------------------</div>
      
      <div class="flex-between">
        <span>Order #:</span>
        <span class="bold">#${o.order_number}</span>
      </div>
      <div class="flex-between">
        <span>Date:</span>
        <span>${new Date(o.order_date).toLocaleDateString()} ${new Date(o.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="flex-between">
        <span>Outlet:</span>
        <span class="bold">${o.outlet}</span>
      </div>
      <div class="flex-between">
        <span>Type:</span>
        <span class="bold uppercase">[${o.delivery_type}]</span>
      </div>

      <div class="divider">--------------------------------</div>
      
      <div class="bold">CUSTOMER DETAILS:</div>
      <div>${o.customer_name}</div>
      <div>Ph: ${o.mobile_number}</div>
      ${o.address ? `<div style="font-size: 11px;">Add: ${o.address}</div>` : ''}

      <div class="divider">--------------------------------</div>

      <div class="bold">ORDER ITEMS:</div>
      <div class="flex-between item-row">
        <span>${o.item_type}</span>
        <span class="bold">Qty: ${o.quantity}</span>
      </div>

      <!-- CAKE PHOTO SECTION -->
      <div class="photo-container">
        <div class="bold center photo-title">[ CAKE PHOTO ]</div>
        <div class="center photo-wrapper">
          <img src="${o.item_image_url || o.delivery_photo_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=80'}" class="cake-photo" alt="Cake Photo" />
        </div>
      </div>

      ${o.remarks ? `
        <div class="notes-box">
          <small>Remarks: ${o.remarks}</small>
        </div>
      ` : ''}

      <div class="divider">--------------------------------</div>

      <div class="flex-between font-large">
        <span>TOTAL:</span>
        <span class="bold">₹${(o.total_amount || 0).toLocaleString()}</span>
      </div>
      <div class="flex-between">
        <span>Advance Paid:</span>
        <span>₹${(o.advance_amount || 0).toLocaleString()}</span>
      </div>
      <div class="flex-between">
        <span>Remaining Due:</span>
        <span class="bold" style="color:${o.remaining_balance > 0 ? '#dc2626' : '#16a34a'}">₹${(o.remaining_balance || 0).toLocaleString()}</span>
      </div>
      <div class="flex-between">
        <span>Payment Mode:</span>
        <span class="bold uppercase">${o.payment_type}</span>
      </div>

      
      ${o.otp ? `
        <div class="center otp-box">
          DELIVERY OTP: <strong>${o.otp}</strong>
        </div>
      ` : ''}

      <div class="divider">--------------------------------</div>
      <div class="center footer-text">Thank you for choosing Broomies!</div>
      <div class="center footer-text">www.broomiesbakery.com</div>
      <div class="cut-line"> - - - - - CUT HERE - - - - - </div>
    </div>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermal Print Receipts - Broomies OMS</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 5mm;
            color: #000;
            background: #fff;
            font-size: 12px;
            line-height: 1.2;
          }
          .receipt {
            margin-bottom: 20px;
            page-break-after: always;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .header-title { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
          .sub-title { font-size: 10px; margin-bottom: 4px; }
          .divider { text-align: center; font-weight: bold; margin: 4px 0; overflow: hidden; white-space: nowrap; }
          .flex-between { display: flex; justify-content: space-between; margin: 2px 0; }
          .font-large { font-size: 14px; }
          .item-row { margin: 6px 0; }
          .photo-container { margin: 8px 0; text-align: center; }
          .photo-title { font-size: 11px; font-weight: bold; margin-bottom: 4px; }
          .photo-wrapper { text-align: center; }
          .cake-photo { max-width: 100%; width: 220px; max-height: 200px; object-fit: cover; border: 1.5px solid #000; border-radius: 4px; display: block; margin: 0 auto; }
          .notes-box { font-style: italic; border: 1px dashed #000; padding: 4px; margin: 4px 0; font-size: 11px; }
          .otp-box { margin: 8px 0; padding: 4px; background: #eee; font-size: 13px; border: 1px solid #000; }
          .footer-text { font-size: 10px; margin-top: 2px; }
          .cut-line { font-size: 9px; text-align: center; margin-top: 15px; margin-bottom: 15px; color: #666; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; text-align: center; background: #f1f5f9; padding: 10px; border-radius: 6px; font-family: sans-serif;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155;">Ready to print ${orders.length} receipt(s) on 80mm thermal paper.</p>
          <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 4px; cursor: pointer;">
            🖨️ Print to Thermal Printer
          </button>
        </div>
        ${receiptHtml}
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
