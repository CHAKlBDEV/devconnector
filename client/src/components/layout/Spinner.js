import React, { Fragment } from 'react';
import spinner from '../../img/loading.gif';

export default () => {
	return (
		<Fragment>
			<img
				src={spinner}
				style={{ width: '20px', margin: 'auto', display: 'block' }}
				alt='loading..'
			/>
		</Fragment>
	);
};
