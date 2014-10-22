var Module = require('module');
var path = require('path');
var sPkgName = require('../package.json').name;

module.exports = function()
{
	if (!Module._mload_alias)
	{
		var _oModuleAlias = Module._mload_alias = {};
		
		var getExistAlias = function(_asAlias, _asSubPath)
		{
			var _oSubAlias = _oModuleAlias[_asSubPath];
			if (_oSubAlias && _oSubAlias.hasOwnProperty)
			{
				return _oSubAlias.hasOwnProperty(_asAlias) && _oSubAlias[_asAlias];
			}
		};

		var originResolveLookupPaths = Module._resolveLookupPaths;
		Module._resolveLookupPaths = function(_asRequire, _aoParent)
		{
			if (_asRequire && _aoParent && _aoParent.id && _aoParent.filename)
			{
				// get nearly mload
				// note: if this is a package, muset load self mload package
				var _oSubPath = [];
				for(var _sMloadPath in _oModuleAlias)
				{
					var _nIndex = _aoParent.filename.indexOf(_sMloadPath);
					if (_nIndex != -1 && _aoParent.filename.substring(_nIndex).indexOf('node_modules') == -1)
					{
						_oSubPath.push(_sMloadPath);
					}
				}

				if (_oSubPath.length)
				{
					_oSubPath.sort(function(_asItem1, _asItem2)
					{
						return _asItem1.length > _asItem2.length ? -1 : 1;
					});

					if (getExistAlias(_asRequire, _oSubPath[0]))
					{
						var _sAliasPath = _oModuleAlias[_asRequire];
						return ['mload_alias', ['mload_alias', _sSubPath]];
					}
				}
			}
			
			return originResolveLookupPaths.apply(Module, arguments);
		};

		var originFindPath = Module._findPath;
		Module._findPath = function(_asRequire, _aoPaths)
		{
			// check if alias
			if (_aoPaths.length == 2 && _aoPaths[0] == 'mload_alias')
			{
				var _sRequirePath = getExistAlias(_asRequire, _aoPaths[1]);
				if (_sRequirePath)
				{
					_asRequire	= _sRequirePath;
					_aoPaths	= [''];
				}
			}

			return originFindPath(_asRequire, _aoPaths);
		}
	}


	// the key of _mload_alias is the path of mload package widthout node_modules
	var _sSubPath = path.dirname(path.dirname(path.dirname(__dirname)));
	return Module._mload_alias[_sSubPath] || (Module._mload_alias[_sSubPath] = {});
};
