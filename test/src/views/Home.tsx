import React, { useState } from 'react';
import "../styles/global.css";
const Home = () => {
	const [count, setCount] = useState(0);
	return (
		<div>
			<h1 className='text-red-500'>Umur kamu sekarang, {count} Tahun.</h1>
			<button onClick={() => setCount(count + 1)}>Tambah Umur</button>
		</div>
	);
};

export default Home;
