import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, auth, ...rest }) => {
	return (
		<div>
			<Route
				{...rest}
				render={props =>
					!auth.isAuthenticated && !auth.loading ? (
						<Redirect to='/login' />
					) : (
						<Component {...props} />
					)
				}
			/>
		</div>
	);
};

PrivateRoute.propTypes = {
	auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
	auth: state.auth
});

export default connect(mapStateToProps, {})(PrivateRoute);
