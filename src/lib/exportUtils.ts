import { Order } from '../types';

export function exportToCSV(orders: Order[], filename = 'broomies_orders.csv') {
  const headers = [
    'Order #',
    'Outlet',
    'Date',
    'Time',
    'Customer Name',
    'Mobile',
    'Address',
    'Item Type',
    'Qty',
    'Type',
    'Total ($)',
    'Advance ($)',
    'Remaining Balance ($)',
    'Payment Status',
    'Order Status',
    'Delivery Partner',
    'Payment Changed By',
    'Payment Changed At'
  ];

  const rows = orders.map((o) => [
    o.order_number,
    `"${o.outlet}"`,
    `"${o.order_date}"`,
    `"${o.order_time || ''}"`,
    `"${o.customer_name}"`,
    `"${o.mobile_number}"`,
    `"${o.address || 'N/A'}"`,
    `"${o.item_type.replace(/"/g, '""')}"`,
    o.quantity,
    o.delivery_type,
    (o.total_amount || 0).toFixed(2),
    (o.advance_amount || 0).toFixed(2),
    (o.remaining_balance || 0).toFixed(2),
    o.payment_type,
    o.status,
    `"${o.delivery_partner || 'Unassigned'}"`,
    `"${o.payment_changed_by || 'System'}"`,
    `"${o.payment_changed_at || ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printPDFReport(orders: Order[], title = 'Broomies Bakery - Order Summary Report') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF/Print report.');
    return;
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalPaid = orders.reduce((sum, o) => sum + (o.advance_amount || 0), 0);
  const totalPending = orders.reduce((sum, o) => sum + (o.remaining_balance || 0), 0);

  const rowsHtml = orders
    .map(
      (o) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">#${o.order_number}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${o.outlet}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${o.customer_name}<br/><small style="color:#666">${o.mobile_number}</small></td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${o.item_type} (x${o.quantity})</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${(o.total_amount || 0).toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${(o.advance_amount || 0).toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">
        <span style="font-weight:600; color: ${o.status === 'delivered' ? 'green' : o.status === 'cancelled' ? 'red' : 'orange'}">
          ${o.status.toUpperCase()}
        </span>
      </td>
    </tr>
  `
    )
    .join('');


  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111; padding: 20px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e11d48; padding-bottom: 15px; margin-bottom: 20px; }
          .brand { font-size: 24px; font-weight: bold; color: #e11d48; letter-spacing: -0.5px; }
          .meta { font-size: 12px; color: #666; text-align: right; }
          .summary { display: flex; gap: 20px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; }
          .stat { flex: 1; }
          .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; }
          .stat-value { font-size: 20px; font-weight: bold; margin-top: 4px; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
          th { background: #0f172a; color: white; padding: 10px 8px; font-weight: 600; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">BROOMIES BAKERY</div>
            <div style="font-size: 14px; color: #475569; font-weight: 500;">${title}</div>
          </div>
          <div class="meta">
            Generated: ${new Date().toLocaleString()}<br/>
            Total Records: ${orders.length}
          </div>
        </div>

        <div class="summary">
          <div class="stat">
            <div class="stat-label">Total Orders</div>
            <div class="stat-value">${orders.length}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total Sales</div>
            <div class="stat-value">$${(totalRevenue || 0).toFixed(2)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Collected Amount</div>
            <div class="stat-value" style="color: #16a34a;">$${(totalPaid || 0).toFixed(2)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Due Balance</div>
            <div class="stat-value" style="color: #dc2626;">$${(totalPending || 0).toFixed(2)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Outlet</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8;" class="no-print">
          Click Print below to save as PDF or print hardcopy
        </div>
        <div style="text-align: center; margin-top: 15px;" class="no-print">
          <button onclick="window.print()" style="background: #e11d48; color: white; border: none; padding: 10px 20px; font-size: 14px; border-radius: 6px; cursor: pointer; font-weight: 600;">Print Report / Save as PDF</button>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
