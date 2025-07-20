'use strict';

// Privacy Policy Page
exports.getPrivacyPolicy = async (req, res) => {
    try {
        const privacyPolicyHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Privacy Policy - BlinkDish</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background-color: #f4f4f9;
                    color: #333;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #fdc329;
                    text-align: center;
                    border-bottom: 2px solid #fdc329;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #555;
                    margin-top: 30px;
                }
                p {
                    margin: 15px 0;
                    text-align: justify;
                }
                .last-updated {
                    font-style: italic;
                    color: #666;
                    text-align: center;
                    margin-bottom: 30px;
                }
                .contact-info {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Privacy Policy</h1>
                <p class="last-updated">Last updated: January 18, 2025</p>
                
                <h2>1. Information We Collect</h2>
                <p>At BlinkDish, we collect information you provide directly to us, such as when you create an account, place an order, or contact us. This may include your name, email address, phone number, delivery address, and payment information.</p>
                
                <h2>2. How We Use Your Information</h2>
                <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and events.</p>
                
                <h2>3. Information Sharing</h2>
                <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share your information with restaurant partners to fulfill your orders and with service providers who assist us in operating our platform.</p>
                
                <h2>4. Data Security</h2>
                <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>
                
                <h2>5. Your Rights</h2>
                <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us. To exercise these rights, please contact us using the information provided below.</p>
                
                <h2>6. Cookies and Tracking</h2>
                <p>We use cookies and similar tracking technologies to enhance your experience on our platform, analyze usage patterns, and provide personalized content and advertisements.</p>
                
                <h2>7. Changes to This Policy</h2>
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
                
                <div class="contact-info">
                    <h2>Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                    <p><strong>Email:</strong> privacy@blinkdish.com</p>
                    <p><strong>Phone:</strong> +91-9876543210</p>
                    <p><strong>Address:</strong> BlinkDish Headquarters, Tech Park, Bangalore, India</p>
                </div>
            </div>
        </body>
        </html>
        `;
        
        res.status(200).send(privacyPolicyHTML);
    } catch (error) {
        console.error('Error loading privacy policy:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Terms and Conditions Page
exports.getTermsAndConditions = async (req, res) => {
    try {
        const termsHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Terms and Conditions - BlinkDish</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    background-color: #f4f4f9;
                    color: #333;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #fdc329;
                    text-align: center;
                    border-bottom: 2px solid #fdc329;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #555;
                    margin-top: 30px;
                }
                p {
                    margin: 15px 0;
                    text-align: justify;
                }
                .last-updated {
                    font-style: italic;
                    color: #666;
                    text-align: center;
                    margin-bottom: 30px;
                }
                .contact-info {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                ul {
                    margin: 15px 0;
                    padding-left: 30px;
                }
                li {
                    margin: 8px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Terms and Conditions</h1>
                <p class="last-updated">Last updated: January 18, 2025</p>
                
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using BlinkDish's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                
                <h2>2. Use License</h2>
                <p>Permission is granted to temporarily download one copy of BlinkDish's materials for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                <ul>
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to reverse engineer any software contained on the platform</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
                
                <h2>3. Service Terms</h2>
                <p>BlinkDish provides a platform connecting customers with restaurant partners for food delivery and subscription services. We reserve the right to modify or discontinue the service at any time without notice.</p>
                
                <h2>4. User Account</h2>
                <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
                
                <h2>5. Payment Terms</h2>
                <p>Payment for services is due at the time of order placement. We accept various forms of payment as indicated on our platform. All prices are subject to change without notice.</p>
                
                <h2>6. Delivery and Cancellation</h2>
                <p>Delivery times are estimates and may vary based on location and availability. Cancellation policies vary by restaurant partner and are clearly stated at the time of order.</p>
                
                <h2>7. Limitation of Liability</h2>
                <p>BlinkDish shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
                
                <h2>8. Governing Law</h2>
                <p>These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.</p>
                
                <div class="contact-info">
                    <h2>Contact Information</h2>
                    <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
                    <p><strong>Email:</strong> legal@blinkdish.com</p>
                    <p><strong>Phone:</strong> +91-9876543210</p>
                    <p><strong>Address:</strong> BlinkDish Headquarters, Tech Park, Bangalore, India</p>
                </div>
            </div>
        </body>
        </html>
        `;
        
        res.status(200).send(termsHTML);
    } catch (error) {
        console.error('Error loading terms and conditions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
