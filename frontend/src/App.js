import React, { useEffect, useState } from 'react';
import './App.css';

const products = [
	{
		name: 'Cloud-knit sneaker',
		category: 'New season',
		price: 98,
		image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
		alt: 'Red performance sneaker on a bright studio background',
	},
	{
		name: 'The everyday tote',
		category: 'Made to carry',
		price: 72,
		image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85',
		alt: 'Structured leather tote bag',
	},
	{
		name: 'Studio timepiece',
		category: 'Small details',
		price: 180,
		image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',
		alt: 'Minimal watch with a clean white face',
	},
	{
		name: 'Form shoulder bag',
		category: 'Just arrived',
		price: 145,
		image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85',
		alt: 'Compact shoulder bag in a warm neutral color',
	},
];

function App() {
	const [storeOnline, setStoreOnline] = useState(false);
	const [bagCount, setBagCount] = useState(0);
	const [bagTotal, setBagTotal] = useState(0);
	const [bagOpen, setBagOpen] = useState(false);
	const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

	useEffect(() => {
		fetch(`${backendUrl}/api/welcome`)
			.then((response) => {
				if (!response.ok) throw new Error('Store service unavailable');
				setStoreOnline(true);
			})
			.catch(() => setStoreOnline(false));
	}, [backendUrl]);

	function addToBag(price) {
		setBagCount((count) => count + 1);
		setBagTotal((total) => total + price);
	}

	return (
		<div className="storefront">
			<div className="announcement">Complimentary shipping on orders over $100</div>

			<header className="site-header">
				<a className="wordmark" href="#top" aria-label="Zylo home">ZYLO<span>.</span></a>
				<nav className="main-nav" aria-label="Main navigation">
					<a href="#new-arrivals">New arrivals</a>
					<a href="#everyday-edit">The everyday edit</a>
				</nav>
				<button
					className="bag-button"
					type="button"
					aria-expanded={bagOpen}
					aria-label={`Shopping bag, ${bagCount} ${bagCount === 1 ? 'item' : 'items'}`}
					onClick={() => setBagOpen((open) => !open)}
				>
					Bag <span>{bagCount}</span>
				</button>
				{bagOpen && (
					<aside className="bag-popover" aria-label="Shopping bag">
						<div className="bag-popover-heading">
							<strong>Your bag</strong>
							<button type="button" onClick={() => setBagOpen(false)} aria-label="Close bag">Close</button>
						</div>
						<p>{bagCount ? `${bagCount} ${bagCount === 1 ? 'item' : 'items'} · $${bagTotal}` : 'Your bag is waiting for something good.'}</p>
						<a href="#new-arrivals" onClick={() => setBagOpen(false)}>Keep exploring</a>
					</aside>
				)}
			</header>

			<main id="top">
				<section className="hero" aria-labelledby="hero-title">
					<div className="hero-copy">
						<p className="eyebrow">Welcome to Zylo <span>·</span> Goods for good days</p>
						<h1 id="hero-title">A little more<br />you, every day.</h1>
						<p className="hero-description">Meet the pieces that make getting dressed, heading out, and doing your thing feel that much better.</p>
						<a className="primary-link" href="#new-arrivals">Shop the latest <span aria-hidden="true">↗</span></a>
					</div>
					<div className="hero-caption"><span>01 / 03</span><span>The everyday, considered.</span></div>
				</section>

				<section className="collection" id="new-arrivals" aria-labelledby="collection-title">
					<div className="section-heading">
						<div>
							<p className="eyebrow">A fresh point of view</p>
							<h2 id="collection-title">Good things, just in.</h2>
						</div>
						<a className="text-link" href="#everyday-edit">Explore the edit <span aria-hidden="true">↗</span></a>
					</div>
					<div className="product-grid">
						{products.map((product, index) => (
							<article className="product" key={product.name}>
								<a className={`product-image product-image-${index + 1}`} href="#everyday-edit" aria-label={`View ${product.name}`}>
									<img src={product.image} alt={product.alt} loading="lazy" />
									<span className="product-category">{product.category}</span>
								</a>
								<div className="product-details">
									<div>
										<h3>{product.name}</h3>
										<p>${product.price}</p>
									</div>
									<button type="button" aria-label={`Add ${product.name} to bag`} onClick={() => addToBag(product.price)}>+</button>
								</div>
							</article>
						))}
					</div>
				</section>

				<section className="edit-banner" id="everyday-edit">
					<p className="eyebrow">Less, but better</p>
					<h2>Keep the good<br />close.</h2>
					<p>Thoughtful finds for wherever the day takes you.</p>
					<a className="text-link" href="#new-arrivals">Find your everyday <span aria-hidden="true">↗</span></a>
				</section>
			</main>

			<footer className="site-footer">
				<a className="wordmark" href="#top">ZYLO<span>.</span></a>
				<p>Good things for the everyday.</p>
				<span className="service-status"><i className={storeOnline ? 'status-dot is-online' : 'status-dot'} />{storeOnline ? 'Store online' : 'Preview mode'}</span>
			</footer>
		</div>
	);
}

export default App;
