import React, { useState } from 'react';

const Home = () => {
	const [count, setCount] = useState(0);
	return (
		<div>
			<h1>Umur kamu sekarang, {count} Tahun.</h1>
			<button onClick={() => setCount(count + 1)}>Tambah Umur</button>
		</div>
	);
};

export default Home;
