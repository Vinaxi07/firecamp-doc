import Category from './category';
import PropTypes from 'prop-types';
import React, {Fragment, useEffect, useMemo, useState} from 'react';
import styled from '@emotion/styled';
import usePrevious from 'react-use/lib/usePrevious';
import {IconArrowDown} from '@apollo/space-kit/icons/IconArrowDown';
import {IconArrowUp} from '@apollo/space-kit/icons/IconArrowUp';
import {IconCollapseList} from '@apollo/space-kit/icons/IconCollapseList';
import {IconExpandList} from '@apollo/space-kit/icons/IconExpandList';
import {IconOutlink} from '@apollo/space-kit/icons/IconOutlink';
import {Link, withPrefix} from 'gatsby';
import colors from '../../../utils/colors';
import {size} from 'polished';
// import {smallCaps} from '../../utils/typography';

const StyledList = styled.ul({
  marginLeft: 0,
  listStyle: 'none',
  marginBottom: 32,
  h6: {
    borderBottom: "1px solid #ccc",
    paddingBottom: "7px",
    marginBottom: "4px",
    fontWeight: "bold"
  }
});

const listItemStyles = {
  color: 'inherit',
  ':hover': {
    // opacity: colors.hoverOpacity
  }
};

const StyledListItem = styled.li({
  marginLeft: "10px",
  fontSize: '1rem',
  lineHeight: 1.5,
  marginBottom: '0.8125rem',
  a: {
    ...listItemStyles,
    textDecoration: 'none',
    '&.active': {
      color: colors.primary,
      pointerEvents: 'none'
    }
  }
});

const ExpandAll = styled.button(listItemStyles, /*smallCaps,*/ {
  display: 'flex',
  alignItems: 'center',
  marginBottom: 12,
  padding: '4px 0',
  border: 0,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1,
  background: 'none',
  outline: 'none',
  cursor: 'pointer',
  svg: {
    ...size(12),
    marginRight: 8
  }
});

const StyledOutlinkIcon = styled(IconOutlink)(size(14), {
  verticalAlign: -1,
  marginLeft: 8,
  // color: colors.text3
});

function getId(title) {
  return withPrefix(title);
}

function isPageSelected(path, pathname) {
  const [a, b] = [withPrefix(path), pathname].map(string =>
    string.replace(/\/$/, '')
  );
  return a === b;
}

function isCategorySelected({path, pages}, pathname) {
  return path
    ? isPageSelected(path, pathname)
    : pages.some(page => isPageSelected(page.path, pathname));
}

function getSidebarState(contents, pathname) {
  const activeCategory = contents.find(category =>
    isCategorySelected(category, pathname)
  );
  if (activeCategory) {
    return {[getId(activeCategory.title)]: true};
  }

  return {};
}

export default function SidebarNav(props) {
  const prevPathname = usePrevious(props.pathname);
  const [state, setState] = useState(
    getSidebarState(props.contents, props.pathname)
  );

  const allExpanded = useMemo(
    () => props.contents.every(({title}) => state[getId(title)]),
    [props.contents, state]
  );

  useEffect(() => {
    if (props.pathname !== prevPathname) {
      const category = props.contents.find(({pages}) =>
        pages.find(page => isPageSelected(page.path, props.pathname))
      );
      if (category) {
        const id = getId(category.title);
        if (!state[id]) {
          setState(prevState => ({
            ...prevState,
            [id]: true
          }));
        }
      }
    }
  }, [props.contents, props.pathname, prevPathname, state, setState]);

  function toggleCategory(title) {
    setState(prevState => {
      const id = getId(title);
      const expanded = !prevState[id];

      if (props.onToggleCategory) {
        props.onToggleCategory(title, expanded);
      }

      return {
        ...prevState,
        [id]: expanded
      };
    });
  }

  function toggleAll() {
    const expanded = !allExpanded;
    setState(
      props.contents.reduce(
        (acc, {title}) => ({
          ...acc,
          [getId(title)]: expanded
        }),
        {}
      )
    );

    if (props.onToggleAll) {
      props.onToggleAll(expanded);
    }
  }

  function generateContent(pages=[], header) {

    const categoryContents = pages.map(page => (
      <StyledListItem key={page.path}>
        {page.anchor ? (
          <a href={page.path} target="_blank" rel="noopener noreferrer">
             {page.title}
            <StyledOutlinkIcon />
          </a>
        ) : (
          <Link
            className={
              isPageSelected(page.path, props.pathname) ? 'active' : null
            }
            to={page.path}
            title={page.description}
            onClick={props.onLinkClick}
          >
            {page.title}
          </Link>
        )}
      </StyledListItem>
    ));

    if(!pages.length) {
      return []
    }
    return [
      header,
      categoryContents
    ]
  }

  // console.log(props, 8888888)
  return (
    <Fragment>
      {props.contents.map(({title, path, pages}, index, array) => {

        let rootPages = !title? pages: [];
        let impressions = pages.filter(p=> /\/i\//.test(p.path));
        let actions = pages.filter(p=> /\/a\//.test(p.path));
        let gestures = pages.filter(p=> /\/g\//.test(p.path));

        const contents = [
          generateContent(rootPages, /*<h6># Root </h6>*/),
          generateContent(impressions, <h6># Impressions </h6>),
          generateContent(actions, <h6># Actions </h6>),
          generateContent(gestures, <h6># Gestures </h6>),
        ]

        if (!title) {
          const Icon = allExpanded ? IconCollapseList : IconExpandList;
          return (
            <Fragment key="root">
              <StyledList>{contents}</StyledList>
              {array.length > 2 && (
                <ExpandAll onClick={toggleAll}>
                  <Icon />
                  {allExpanded ? 'Collapse' : 'Expand'} all
                </ExpandAll>
              )}
            </Fragment>
          );
        }

        const isExpanded = state[getId(title)] || props.alwaysExpanded;
        return (
          <Category
            key={title}
            title={title}
            path={path}
            icon={isExpanded ? IconArrowUp : IconArrowDown}
            active={isCategorySelected({pages, path}, props.pathname)}
            onClick={props.alwaysExpanded ? null : toggleCategory}
          >
            <StyledList
              style={{
                display: isExpanded ? 'block' : 'none'
              }}
            >
              {contents}
            </StyledList>

          </Category>
        );
      })}
    </Fragment>
  );
}

SidebarNav.propTypes = {
  alwaysExpanded: PropTypes.bool,
  contents: PropTypes.array.isRequired,
  pathname: PropTypes.string.isRequired,
  onToggleAll: PropTypes.func,
  onToggleCategory: PropTypes.func,
  onLinkClick: PropTypes.func
};
