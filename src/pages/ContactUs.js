import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would handle form submission here,
    // e.g., send the data to a backend server or an email service.
    console.log({ name, email, message });
    setSubmitted(true);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Versant Practice Test</title>
        <meta name="description" content="Have questions? Contact the Versant Practice Test team. We are here to help you with your test preparation needs." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
          <div>
            <h1 className="text-center text-3xl font-extrabold text-gray-900">
              Get in Touch
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Have a question or feedback? Fill out the form below or email us at <a href="mailto:support@versantpracticetest.com" className="font-medium text-green-600 hover:text-green-500">support@versantpracticetest.com</a>.
            </p>
          </div>
          {submitted ? (
            <div className="text-center p-4 bg-green-100 text-green-800 rounded-md">
              <h3 className="text-lg font-medium">Thank you!</h3>
              <p className="mt-1">Your message has been sent successfully. We'll get back to you soon.</p>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="name" className="sr-only">Name</label>
                  <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" placeholder="Your Name" />
                </div>
                <div>
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" placeholder="Email address" />
                </div>
                <div>
                  <label htmlFor="message" className="sr-only">Message</label>
                  <textarea id="message" name="message" rows="4" required value={message} onChange={(e) => setMessage(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" placeholder="Your Message"></textarea>
                </div>
              </div>

              <div>
                <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}