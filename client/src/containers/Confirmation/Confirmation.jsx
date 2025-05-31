import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReservedProducts from "../../components/ReservedProducts/ReservedProducts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import "./confirmation.css";

const Confirmation = (props) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceContent, setInvoiceContent] = useState(null);

  // Function to generate the invoice HTML
  const createInvoiceHtml = () => {
    // Get current date for the invoice
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Generate invoice number and order ID
    const invoiceNumber = Math.floor(10000 + Math.random() * 90000);
    const orderId = Math.floor(100000 + Math.random() * 900000);
    
    // Create invoice HTML content
    return `
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="invoice-company">
            <h1>Farm to Table</h1>
            <p>123 Harvest Lane</p>
            <p>Farmville, CA 90210</p>
            <p>Phone: (555) 123-4567</p>
          </div>
          <div class="invoice-details">
            <h2>INVOICE</h2>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
          </div>
        </div>
        
        <div class="invoice-customer">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${localStorage.getItem('firstName') || 'Customer'} ${localStorage.getItem('lastName') || ''}</p>
          <p><strong>Email:</strong> ${localStorage.getItem('email') || 'customer@example.com'}</p>
        </div>
        
        <div class="invoice-items">
          <h3>Order Details</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${props.history.location.state.line.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>$${(item.totalCost / item.quantity).toFixed(2)}</td>
                  <td>$${item.totalCost.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3"><strong>Subtotal</strong></td>
                <td>$${props.history.location.state.subTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3"><strong>Tax (7.25%)</strong></td>
                <td>$${(props.history.location.state.subTotal * 0.0725).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3"><strong>Total</strong></td>
                <td>$${(props.history.location.state.subTotal * 1.0725).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="invoice-footer">
          <p>Thank you for supporting local farmers and shopping with Farm to Table!</p>
          <p>We look forward to seeing you at pickup!</p>
        </div>
      </div>
    `;
  };

  // Function to show the invoice preview on the page
  const showInvoicePreview = () => {
    const invoiceHtml = createInvoiceHtml();
    setInvoiceContent(invoiceHtml);
    setShowInvoice(true);
  };
  
  // Function to download the PDF invoice
  const downloadInvoice = () => {
    const invoiceElement = document.getElementById('invoice-preview');
    
    // Create a new PDF document
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Convert the HTML to a canvas
    html2canvas(invoiceElement, { 
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
    }).then(canvas => {
      // Get the image data from the canvas
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit the PDF page
      const imgWidth = pageWidth - 40; // Full page width with 20pt margins on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if the height exceeds the page height
      if (imgHeight > pageHeight - 40) {
        const contentAspectRatio = canvas.width / canvas.height;
        const pageAspectRatio = imgWidth / (pageHeight - 40);
        
        // Adjust to fit within the page height
        if (contentAspectRatio < pageAspectRatio) {
          const newHeight = pageHeight - 40;
          const newWidth = newHeight * contentAspectRatio;
          doc.addImage(imgData, 'PNG', (pageWidth - newWidth) / 2, 20, newWidth, newHeight);
        } else {
          doc.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
        }
      } else {
        // Center the image horizontally
        doc.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
      }
      
      // Save the PDF
      doc.save('FarmToTable_Invoice.pdf');
      
      // Hide the invoice after PDF is generated
      setShowInvoice(false);
      
      // Show success message
      toast.success("Invoice downloaded successfully! Thank you for shopping with Farm to Table.", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });
  };

  return (
    <section className="section">
      {showInvoice ? (
        <div className="invoice-overlay">
          <div className="invoice-modal">
            <div className="invoice-modal-header">
              <h2>Your Invoice</h2>
              <div className="invoice-buttons">
                <button className="button" id="downloadBtn" onClick={downloadInvoice}>
                  Download PDF
                </button>
                <button className="button" id="closeBtn" onClick={() => setShowInvoice(false)}>
                  Close
                </button>
              </div>
            </div>
            <div 
              id="invoice-preview" 
              className="invoice-preview"
              dangerouslySetInnerHTML={{ __html: invoiceContent }} 
            />
          </div>
        </div>
      ) : (
        <div className="container has-text-centered">
          <div className="columns is-centered is-mulitline"></div>
          <div className="columns is-vcentered">
            <div className="column is-two-thirds">
              <img
                src="./assets/icons/login_1.svg"
                className="figure-img img-fluid rounded"
                id="IconConfirm"
                alt="avocado and apple"
              />
              <h3 className="title confirm-head-one"> Thank You!</h3>
              <h3 className="title confirm-head-two">
                {" "}
                Your order has been received!
              </h3>
              <p className="subtitle confirm-text">
                {" "}
                We look forward to seeing you and handing you only the freshest
                ingredients available this season! We accept debit and credit card
                & cash.{" "}
              </p>
              <div className="buttons is-centered">
                <Link
                  to="/allproducts"
                  className="button"
                  type="button"
                  id="continueBtn"
                >
                  Continue Shopping
                </Link>
                <button
                  className="button"
                  type="button"
                  id="invoiceBtn"
                  onClick={showInvoicePreview}
                >
                  View Invoice
                </button>
              </div>
            </div>
            <div className="column">
              <nav className="panel">
                <p className="panel-heading order-head">Order Summary</p>

                <ReservedProducts
                  items={props.history.location.state.line}
                  total={props.history.location.state.subTotal}
                />

                <div className="field is-grouped is-grouped-centered previous-orders">
                  <Link
                    className="button is-half"
                    id="view-previous-orders"
                    to="/orderHistory"
                  >
                    View Previous Orders
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Confirmation;