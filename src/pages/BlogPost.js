import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import blogPosts from '../data/blogPosts.json';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Post not found</h1>
            <Link to="/blog" className="text-green-600 hover:underline mt-4 inline-block">Back to Blog</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | Versant Test Blog</title>
        <meta name="description" content={post.summary} />
      </Helmet>
      <Header />
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl tracking-tight">{post.title}</h1>
            <div className="mt-6">
              <p className="text-lg text-gray-500">By {post.author} &middot; {new Date(post.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div 
            className="mt-12 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className="mt-12 text-center">
            <Link to="/blog" className="text-green-600 hover:underline font-medium">
              &larr; Back to All Posts
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
