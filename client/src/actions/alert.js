import { SET_ALERT, REMOVE_ALERT } from './types';
import uuid from 'uuid';

export const setAlert = (msg, alertType) => dispatch => {
	const id = uuid.v5();
	dispatch({
		type: SET_ALERT,
		payload: { msg, alertType, id }
	});
};
