import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import blogPostsData from '../data/blogPosts.json';
import './NewBlogPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NewBlogPage = () => {
    const [filter, setFilter] = useState('all');
    const [displayedPosts, setDisplayedPosts] = useState(9);
    const [filteredPosts, setFilteredPosts] = useState([]);

    useEffect(() => {
        const posts = filter === 'all'
            ? blogPostsData
            : blogPostsData.filter(post => post.category === filter);
        setFilteredPosts(posts);
    }, [filter]);

    const loadMoreBlogs = () => {
        setDisplayedPosts(prev => prev + 6);
    };

    const handleSubscription = (event) => {
        event.preventDefault();
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        
        const originalHTML = form.innerHTML;
        form.innerHTML = '<div class="text-green-400 font-medium py-3">✓ Successfully subscribed! Welcome to our weekly newsletter.</div>';
        
        setTimeout(() => {
            form.innerHTML = originalHTML;
        }, 3000);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const featuredPost = blogPostsData.find(p => p.featured);

    const categoryColors = {
        testprep: 'bg-green-100 text-green-800',
        skilldev: 'bg-emerald-100 text-emerald-800'
    };

    return (
        <div className="bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {featuredPost && (
                    <section className="mb-12">
                        <article className="featured-gradient rounded-2xl overflow-hidden text-white">
                            <div className="p-8 md:p-12">
                                <div className="flex items-center mb-4">
                                    <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-medium">Featured</span>
                                    <time className="text-white text-opacity-80 ml-4 text-sm" dateTime={featuredPost.date}>{formatDate(featuredPost.date)}</time>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{featuredPost.title}</h2>
                                <p className="text-lg text-white text-opacity-90 mb-6 max-w-3xl">{featuredPost.excerpt}</p>
                                <div className="flex items-center justify-between">
                                    <Link to={`/blog/${featuredPost.id}`} className="bg-white text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                                        Read Full Article
                                    </Link>
                                    <div className="text-white text-opacity-80 text-sm">
                                        <span>{featuredPost.readTime}</span> • <span>{featuredPost.views} views</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </section>
                )}

                <section>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Articles</h2>
                        <div className="text-sm text-gray-600">
                            Showing <span>{Math.min(displayedPosts, filteredPosts.length)}</span> of {filteredPosts.length} articles
                        </div>
                    </div>
                     <div className="flex justify-center md:justify-start space-x-6 mb-8 border-b">
                        <button className={`filter-btn pb-2 ${filter === 'all' ? 'text-green-600 font-medium border-b-2 border-green-600' : 'text-gray-600 hover:text-green-600 transition-colors'}`} onClick={() => setFilter('all')}>All Posts</button>
                        <button className={`filter-btn pb-2 ${filter === 'testprep' ? 'text-green-600 font-medium border-b-2 border-green-600' : 'text-gray-600 hover:text-green-600 transition-colors'}`} onClick={() => setFilter('testprep')}>Test Prep</button>
                        <button className={`filter-btn pb-2 ${filter === 'skilldev' ? 'text-green-600 font-medium border-b-2 border-green-600' : 'text-gray-600 hover:text-green-600 transition-colors'}`} onClick={() => setFilter('skilldev')}>Skill Development</button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" id="blogGrid">
                        {filteredPosts.slice(0, displayedPosts).map(post => (
                            <article key={post.id} className="blog-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" data-category={post.category}>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[post.category]}`}>
                                            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                                        </span>
                                        <time className="text-gray-500 text-sm" dateTime={post.date}>
                                            {formatDate(post.date)}
                                        </time>
                                    </div>
                                    <Link to={`/blog/${post.id}`}>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight hover:text-green-600 transition-colors cursor-pointer">
                                            {post.title}
                                        </h3>
                                    </Link>
                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <Link to={`/blog/${post.id}`} className="text-green-600 font-medium text-sm hover:text-green-800 transition-colors">
                                            Read More →
                                        </Link>
                                        <div className="text-gray-500 text-xs">
                                            {post.readTime} • {post.views} views
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {displayedPosts < filteredPosts.length && (
                    <div className="text-center mt-12">
                        <button id="loadMoreBtn" className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors" onClick={loadMoreBlogs}>
                            Load More Articles
                        </button>
                    </div>
                )}
            </main>

            <section className="bg-gray-900 text-white py-16 mt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Never Miss an Update</h2>
                    <p className="text-xl text-gray-300 mb-8">Get our latest Versant prep articles delivered to your inbox every week</p>
                    <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleSubscription}>
                        <input type="email" placeholder="Enter your email address" className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                        <button type="submit" className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors">
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default NewBlogPage;