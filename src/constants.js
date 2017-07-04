import { getParameterByName } from './utils';

const constants = {
  json: getParameterByName('json'),
  custTracker: getParameterByName('custTracker'),
  fet: getParameterByName('fet'),
  ct: getParameterByName('ct'),
  cte: getParameterByName('cte'),
  tags: getParameterByName('tags'),
};

export default constants;
