import React, { useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { getCurrentProfile } from '../../actions/profile';
import PropTypes from 'prop-types';
import Spinner from './../layout/Spinner';

const Dashboard = ({
	getCurrentProfile,
	auth,
	profile: { profile, loading }
}) => {
	useEffect(() => {
		getCurrentProfile();
	}, []);
	return loading && profile === null ? (
		<Spinner />
	) : (
		<Fragment>
			<h1 className='large text-primary'>Dashboard</h1>
			<p className='lead'>
				<i className='fas fa-user'></i> Welcome {auth.user.name}
			</p>
			{profile !== null ? (
				<Fragment>Has</Fragment>
			) : (
				<Fragment>
					<p>You haven't created a profile yet.</p>
					<Link
						to='/create-dashboard'
						className='btn btn-primary'
						style={{ marginTop: '20px' }}
					>
						Create Profile
					</Link>
				</Fragment>
			)}
		</Fragment>
	);
};

Dashboard.propTypes = {
	getCurrentProfile: PropTypes.func,
	auth: PropTypes.object.isRequired,
	profile: PropTypes.object
};

const mapStateToProps = state => ({
	profile: state.profile,
	auth: state.auth
});

export default connect(mapStateToProps, { getCurrentProfile })(Dashboard);
