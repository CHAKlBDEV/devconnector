import {
	PROFILE_LOADED,
	PROFILE_ERROR,
	PROFILE_CLEAR
} from './../actions/types';

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
		case PROFILE_CLEAR:
			return { ...state, loading: false, profile: null, repos: [] };
		default:
			return state;
	}
}
