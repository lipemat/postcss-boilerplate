const config = require( '../helpers/package-config' );
let jest = require( 'jest' );

/**
 * UGH! Currently Jest does not have a proper public api for passing configuration so we have
 * to have configuration files in the root of the project.
 *
 * We pull what we need from our `jest.config.js` from there.
 *
 * @notice may become available later https://github.com/facebook/jest/pull/7696
 *
 */

jest.runCLI( {}, [config.workingDirectory] );
