import React, { useState } from "react";
import "./contact.css";
import { toast } from "react-toastify";
import emailjs from "emailjs-com";

// Form for the user to contact website
const ContactForm = () => {
  const [status, setStatus] = useState("Submit");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  
  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setStatus("Sending...");
      
      // Try with different parameter names that might match your template
      const templateParams = {
        // Try multiple variations of parameter names that might match your template
        // The EmailJS template might be expecting specific parameter names
        name: formData.name,
        from_name: formData.name,
        to_name: "Farm to Table Team",
        email: formData.email,
        from_email: formData.email,
        message: formData.message,
        reply_to: formData.email
      };
      
      console.log("Sending email with params:", templateParams);
      
      await emailjs.send(
        "service_li10p5j", 
        "template_f875lwz", 
        templateParams, 
        "J81FZuXzZ9RyJs4E_"
      );
      
      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        message: ""
      });
      
      setStatus("Submit");
      
      toast.success(
        "Thank you for reaching out! We will get back to you soon.",
        { hideProgressBar: true, autoClose: 5000 }
      );
      
    } catch (error) {
      console.error("Email sending failed:", error);
      setStatus("Submit");
      toast.error(
        "Sorry, there was an error sending your message. Please try again.",
        { hideProgressBar: true, autoClose: 5000 }
      );
    }
  };
  
  return (
    <div>
      <form className="box" onSubmit={handleSubmit}>
        <div className="columns is-centered is-mobile">
          <img
            src="./assets/icons/signUp_2.svg"
            className="figure-img img-fluid rounded"
            id="signUp-icon-2"
            alt="tomato and pear icon"
          />
          <h3 className="title" id="contact-headline">
            Contact Us
          </h3>
          <img
            src="./assets/icons/login_1.svg"
            className="figure-img img-fluid rounded"
            id="login-icon-1"
            alt="apple avocado icon"
          />
        </div>
        <p className="has-text-centered contact-text">
          Thank you for supporting your community and shopping locally! Please
          reach out to us with any questions.
        </p>
        <div className="field">
          <label className="label">Name:</label>
          <div className="control">
            <input
              className="input"
              type="text"
              id="name"
              placeholder="Old Macdougal"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="email">
            Email:
          </label>
          <div className="control">
            <input
              className="input"
              type="email"
              id="email"
              placeholder="oldmacdonald@domain.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="message">
            Message
          </label>
          <div className="control">
            <textarea
              className="textarea"
              id="message"
              placeholder="How can we help?"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
        </div>

        <div className="field has-text-centered">
          <button 
            className="button" 
            id="login-btn" 
            type="submit" 
            disabled={status === "Sending..."}
          >
            {status}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;