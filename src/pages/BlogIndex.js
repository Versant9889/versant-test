import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import blogPostsData from '../data/blogPosts.json'; // Renamed to avoid conflict

const POSTS_PER_LOAD = 6; // Number of posts to load at a time

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [postsToShow, setPostsToShow] = React.useState(POSTS_PER_LOAD);

  const { featuredPost, otherPosts, categories } = React.useMemo(() => {
    // Sort posts by date in descending order to ensure the latest is featured
    const sortedBlogPosts = [...blogPostsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const featured = sortedBlogPosts.length > 0 ? sortedBlogPosts[0] : null;
    const others = sortedBlogPosts.slice(1);
    // Get unique categories from all posts
    const cats = ['all', ...new Set(blogPostsData.map(post => post.category))];
    return { featuredPost: featured, otherPosts: others, categories: cats };
  }, []);

  const filteredPosts = React.useMemo(() => {
    let posts = otherPosts;
    if (activeCategory !== 'all') {
      posts = otherPosts.filter(post => post.category === activeCategory);
    }
    return posts;
  }, [activeCategory, otherPosts]);

  const postsToDisplay = React.useMemo(() => {
    return filteredPosts.slice(0, postsToShow);
  }, [filteredPosts, postsToShow]);

  const handleLoadMore = React.useCallback(() => {
    setPostsToShow(prev => prev + POSTS_PER_LOAD);
  }, []);

  const handleNewsletterSignup = React.useCallback((event) => {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    alert(`Thank you for subscribing with ${email}!`);
    // In a real application, you would send this email to your backend
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>Blog - Versant Test Prep Insights</title>
        <meta name="description" content="Discover expert insights, tips, and strategies to improve your English proficiency for the Versant Test and drive more organic traffic." />
        <meta name="keywords" content="Versant, blog, English test, test prep, language learning, SEO" />
      </Helmet>

      {/* Header Section */}
      <header className="gradient-bg text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">Discover expert insights, tips, and strategies to boost your English proficiency and ace your Versant Test.</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-grow">
        {/* Featured Post */}
        {featuredPost && (
          <section className="mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Featured Article</h2>
            <article className="bg-white rounded-2xl shadow-xl overflow-hidden blog-card">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img src={`${process.env.PUBLIC_URL}${featuredPost.imageUrl}`} alt={featuredPost.title} className="h-64 md:h-full w-full object-cover" />
                </div>
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <div className="flex items-center mb-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{featuredPost.category}</span>
                    <span className="text-gray-500 ml-4 text-sm">{featuredPost.date} by {featuredPost.author}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    <Link to={`/blog/${featuredPost.slug}`} className="hover:text-green-700 transition duration-300">
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="text-gray-700 text-lg mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                  <Link to={`/blog/${featuredPost.slug}`} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 self-start">
                    Read Full Article
                  </Link>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Categories Filter */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setPostsToShow(POSTS_PER_LOAD); // Reset posts to show when category changes
                }}
                className={`tag bg-white border-2 ${activeCategory === category ? 'border-green-600 text-green-600' : 'border-gray-300 text-gray-600'} px-6 py-2 rounded-full font-medium hover:border-green-600 hover:text-green-600 transition-all duration-300`}
              >
                {category === 'all' ? 'All Posts' : category}
              </button>
            ))}
          </div>
        </section>

        {/* Blog Grid */}
        <section>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="blogGrid">
            {postsToDisplay.map(post => (
              <article key={post.id} className="blog-card bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <img src={`${process.env.PUBLIC_URL}${post.imageUrl}`} alt={post.title} className="h-56 w-full object-cover" />
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center mb-3">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{post.category}</span>
                    <span className="text-gray-500 ml-auto text-sm">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2 flex-grow">
                    <Link to={`/blog/${post.slug}`} className="hover:text-green-700 transition duration-300">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`} className="text-green-600 font-medium hover:text-green-800 transition-colors duration-300 mt-auto">
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Load More Button */}
        {postsToDisplay.length < filteredPosts.length && (
          <div className="text-center mt-12">
            <button
              onClick={handleLoadMore}
              className="bg-green-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-700 transition-all duration-300 shadow-lg"
            >
              Load More Articles
            </button>
          </div>
        )}
      </main>

      {/* Newsletter Signup */}
      <section className="bg-gray-800 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated with Versant Insights</h2>
          <p className="text-xl text-gray-300 mb-8">Get the latest Versant tips and strategies delivered directly to your inbox.</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleNewsletterSignup}>
            <input type="email" placeholder="Enter your email address" className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500" required />
            <button type="submit" className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors duration-300">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Blog Categories</h3>
              <ul className="space-y-2 text-gray-300">
                {categories.filter(cat => cat !== 'all').map(cat => (
                  <li key={cat}><button onClick={() => {
                    setActiveCategory(cat);
                    setPostsToShow(POSTS_PER_LOAD);
                  }} className="hover:text-white transition-colors">{cat}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Popular Posts</h3>
              <ul className="space-y-2 text-gray-300">
                {/* Placeholder for popular posts - would dynamically load in a real app */}
                <li><Link to="/blog/mastering-versant-test" className="hover:text-white transition-colors">Mastering the Versant Test</Link></li>
                <li><Link to="/blog/common-versant-mistakes" className="hover:text-white transition-colors">5 Common Mistakes</Link></li>
                <li><Link to="/blog/improve-pronunciation-versant" className="hover:text-white transition-colors">Improve Pronunciation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {/* Placeholder for social media icons */}
                <a href="#" className="text-gray-300 hover:text-white transition-colors"><i className="fab fa-twitter"></i></a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors"><i className="fab fa-linkedin"></i></a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors"><i className="fab fa-facebook"></i></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Versant Test. All rights reserved. | Designed for English Proficiency</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
