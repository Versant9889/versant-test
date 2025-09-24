import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function AboutUs() {
  return (
    <>
      <Helmet>
        <title>About Us | Versant Practice Test Experts</title>
        <meta name="description" content="Learn about our mission to help you succeed on the Versant test. Discover how our expert-designed Versant practice tests can boost your English skills and confidence." />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl text-center">
              About Our Versant Test Platform
            </h1>
            <p className="mt-6 text-xl text-gray-600 text-center">
              Your trusted partner in preparing for the Versant English Test.
            </p>

            <div className="mt-12 prose prose-lg text-gray-600 mx-auto">
              <p>
                In today's globalized world, proving your English proficiency is more important than ever. The Versant test is a critical step for many students and professionals to validate their skills for academic admissions, corporate recruitment, and career advancement. We understand the pressure and the high stakes involved. That's why we created this platform: to provide a reliable, accessible, and effective resource for anyone preparing for the Versant English assessment.
              </p>
              <p>
                Our journey began with a simple observation: while the Versant test is widely used, there was a lack of high-quality, realistic practice materials available online. We saw learners struggling to find a way to simulate the real test environment and get a true measure of their readiness. We decided to bridge that gap by developing a comprehensive <Link to="/test">Versant practice test</Link> that mirrors the official exam in format, timing, and difficulty.
              </p>

              <h2 className="text-3xl font-extrabold text-gray-900 mt-12">Our Mission</h2>
              <p>
                Our mission is to empower English language learners by providing the most accurate and effective Versant practice tests. We are committed to helping you build the skills and confidence needed to not only pass the Versant test but to excel and achieve your academic and professional goals.
              </p>

              <h2 className="text-3xl font-extrabold text-gray-900 mt-12">Our Vision</h2>
              <p>
                Our vision is to be the world's leading platform for Versant test preparation. We aim to create a global community of proficient and confident English speakers who can thrive in any academic or professional environment, supported by our innovative and user-friendly learning tools.
              </p>

              <h2 className="text-3xl font-extrabold text-gray-900 mt-12">Why Choose Us?</h2>
              <ul>
                <li><strong>Realistic Test Simulation:</strong> Our practice tests are carefully designed to mimic the structure, question types, and time constraints of the real Versant test.</li>
                <li><strong>Instant Feedback:</strong> Receive a detailed analysis of your performance to identify your strengths and weaknesses in speaking, listening, reading, and writing.</li>
                <li><strong>Build Confidence:</strong> Familiarize yourself with the test format and reduce anxiety, so you can perform at your best when it truly counts.</li>
                <li><strong>Accessible Anywhere:</strong> Practice anytime, anywhere, on any device. All you need is an internet connection to start your journey towards success.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}