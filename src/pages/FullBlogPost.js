
import React from 'react';
import { useParams } from 'react-router-dom';
import blogPostsData from '../data/blogPosts.json';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './FullBlogPost.css';

const FullBlogPost = () => {
    const { slug } = useParams();
    const post = blogPostsData.find(p => p.slug === slug);

    if (!post) {
        return <div>Post not found</div>;
    }

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="bg-gray-50">
            <Header />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article>
                    <header className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
                        <div className="text-gray-600 text-sm">
                            <span>By {post.author || 'AI Assistant'}</span> | 
                            <time dateTime={post.date}> {formatDate(post.date)}</time> | 
                            <span>{post.readTime}</span>
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
