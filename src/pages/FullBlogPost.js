
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import blogPostsData from '../data/blogPosts.json';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './FullBlogPost.css';

const FullBlogPost = () => {
    const { slug } = useParams();
    const post = blogPostsData.find(p => p.slug === slug);

    if (!post) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col justify-between">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Post Not Found</h1>
                    <p className="text-gray-600 mb-6">The article you are looking for does not exist or has been moved.</p>
                    <Link to="/blog" className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition">
                        Back to All Guides
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const canonicalUrl = `https://versantpro.com/blog/${post.slug}`;

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt,
        "image": `https://versantpro.com${post.imageUrl}`,
        "author": {
            "@type": "Organization",
            "name": post.author || "VersantPro Team",
            "url": "https://versantpro.com"
        },
        "publisher": {
            "@type": "Organization",
            "name": "VersantPro",
            "logo": {
                "@type": "ImageObject",
                "url": "https://versantpro.com/logo.png"
            }
        },
        "datePublished": post.date,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col justify-between">
            <Helmet>
                <title>{post.title} | VersantPro Guide</title>
                <meta name="description" content={post.excerpt} />
                <link rel="canonical" href={canonicalUrl} />

                {/* OpenGraph / Facebook */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:image" content={`https://versantpro.com${post.imageUrl}`} />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={canonicalUrl} />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={post.excerpt} />
                <meta name="twitter:image" content={`https://versantpro.com${post.imageUrl}`} />

                {/* Article Schema */}
                <script type="application/ld+json">
                    {JSON.stringify(articleSchema)}
                </script>
            </Helmet>

            <Header />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                <article>
                    <header className="mb-8">
                        <img src={`${process.env.PUBLIC_URL}${post.imageUrl}`} alt={post.title} className="w-full h-auto rounded-2xl shadow-md mb-8 border border-gray-200" />
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight">{post.title}</h1>
                        <div className="text-gray-500 text-sm font-medium flex items-center gap-3">
                            <span>By <strong className="text-gray-700">{post.author || 'VersantPro Team'}</strong></span>
                            <span>•</span>
                            <time dateTime={post.date}>{formatDate(post.date)}</time>
                            <span>•</span>
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{post.readTime}</span>
                        </div>
                    </header>
                    
                    <div 
                        className="prose lg:prose-xl max-w-none mx-auto blog-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </main>
            <Footer />
        </div>
    );
};

export default FullBlogPost;
