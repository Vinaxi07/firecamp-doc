import PropTypes from 'prop-types';
import React from 'react';
import {SEO} from 'gatsby-theme-apollo-core';
import {withPrefix} from 'gatsby';

export default function CustomSEO({image, baseUrl, twitterHandle, ...props}) {

  const imagePath = withPrefix('/' + image);
  // console.log(props, imagePath, 8888)
  return (
    <SEO {...props} twitterCard="summary_large_image" favicon="/images/256x256.ico">
      <meta property="og:image" content={imagePath} />
      {/* {baseUrl && <meta name="twitter:image" content={baseUrl + imagePath} />} */}
      {twitterHandle && (
        <meta name="twitter:site" content={`@${twitterHandle}`} />
      )}
    </SEO>
  );
}

CustomSEO.propTypes = {
  baseUrl: PropTypes.string,
  image: PropTypes.string.isRequired,
  twitterHandle: PropTypes.string
};
