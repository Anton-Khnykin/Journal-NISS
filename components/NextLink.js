import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

class NextLink extends React.Component {
  render() {
    const {
      href,
      hrefAs,
      target,
      className,
      children } = this.props
    
    return (
      <Link
        href={href}
        as={hrefAs}
        prefetch
      >
        <a
          className={className}
          target={target}
        >
          {children}
        </a>
      </Link>
    )
  }
}

NextLink.propTypes = {
  href: PropTypes.string.isRequired,
  hrefAs: PropTypes.string,
  target: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.any.isRequired
};

export default NextLink;
