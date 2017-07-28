import { getParameterByName } from './utils';

const constants = {
  json: getParameterByName('json'),
  custTracker: getParameterByName('custTracker'),
  fet: getParameterByName('fet'),
  ct: getParameterByName('ct'),
  cte: getParameterByName('cte'),
  tags: getParameterByName('tags'),
  pgId: getParameterByName('pgId'),
  preview: getParameterByName('preview'),
  md5: getParameterByName('md5'),
};

export default constants;
