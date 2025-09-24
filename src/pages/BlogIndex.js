import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import blogPosts from '../data/blogPosts.json';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function BlogIndex() {
  return (
    <>
      <Helmet>
        <title>Blog | Versant Practice Test</title>
        <meta name="description" content="Read our blog for tips, tricks, and insights on how to prepare for the Versant English Test and improve your language skills." />
      </Helmet>
      <Header />
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl tracking-tight">
              The Versant Test Blog
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-500">
              Tips, tricks, and insights on how to prepare for the Versant English Test.
            </p>
          </div>

          <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-2 lg:max-w-none">
            {blogPosts.map((post) => (
              <div key={post.slug} className="flex flex-col rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <Link to={`/blog/${post.slug}`} className="block mt-2">
                      <p className="text-2xl font-bold text-gray-900 hover:text-green-600">{post.title}</p>
                      <p className="mt-3 text-base text-gray-500">{post.summary}</p>
                    </Link>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="text-sm text-gray-500">
                      <span>By {post.author}</span>
                      <span className="mx-1">&middot;</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
