import { PROFILE_LOADED, PROFILE_ERROR } from './../actions/types';

const initialState = {
	profile: null,
	profiles: [],
	repos: [],
	loading: true,
	error: {}
};

export default function(state = initialState, action) {
	switch (action.type) {
		case PROFILE_LOADED:
			return { ...state, profile: action.payload, loading: false };
		case PROFILE_ERROR:
			return { ...state, loading: false, error: action.payload };
		default:
			return state;
	}
}
