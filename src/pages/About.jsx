import React from 'react';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">About Versant Test</h1>
            <p className="mt-4 text-lg text-gray-500">
              Welcome to Versant Test, your premier destination for comprehensive English language assessment. Our platform is meticulously designed to provide a robust and user-friendly experience for individuals seeking to evaluate and improve their English proficiency.
            </p>

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">Our Purpose</h2>
              <p className="mt-4 text-lg text-gray-500">
                The Versant English Test is a cutting-edge assessment tool that measures the English speaking, listening, reading, and writing skills of non-native speakers. Our primary purpose is to offer an accurate, reliable, and convenient way for individuals to gauge their English language abilities for academic, professional, or personal development.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                We understand the importance of English as a global language of communication. Whether you are a student preparing for university admission, a professional aiming to advance your career, or an individual passionate about mastering a new language, our platform is here to support you on your journey.
              </p>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">Why We Built This Platform</h2>
              <p className="mt-4 text-lg text-gray-500">
                We built the Versant Test platform with a clear vision: to democratize English language assessment. We believe that everyone should have access to high-quality, affordable, and convenient tools to measure their language skills.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                Our platform addresses several key challenges in language assessment:
              </p>
              <ul className="mt-4 space-y-4 text-lg text-gray-500">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <span className="ml-3">
                    <span className="font-bold">Accessibility:</span> Traditional language testing methods can be expensive, time-consuming, and geographically restrictive. Our online platform allows you to take the test from anywhere, at any time, using only a computer and an internet connection.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <span className="ml-3">
                    <span className="font-bold">Accuracy:</span> The Versant Test is powered by a patented, AI-driven scoring system that provides objective and consistent results. This technology ensures that your test is graded with the same level of precision as a human expert, but without the potential for bias.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <span className="ml-3">
                    <span className="font-bold">Comprehensiveness:</span> Our test covers all four key language skills: speaking, listening, reading, and writing. This holistic approach provides a well-rounded assessment of your English proficiency, giving you a clear understanding of your strengths and areas for improvement.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 text-green-500">✓</span>
                  <span className="ml-3">
                    <span className="font-bold">Actionable Insights:</span> Upon completion of the test, you will receive a detailed score report with actionable insights into your performance. This feedback will help you identify specific areas to focus on in your language learning journey.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">Our Commitment</h2>
              <p className="mt-4 text-lg text-gray-500">
                We are committed to providing a world-class language assessment experience that is both effective and empowering. We continuously invest in research and development to ensure that our platform remains at the forefront of language testing technology.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                Thank you for choosing Versant Test. We are excited to be a part of your language learning journey and look forward to helping you achieve your goals.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
