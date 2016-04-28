/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 * http://spin.js.org/
 * ES6ified by Cole Chamberlain
 *
 * Example:
    var opts = {
      lines: 12             // The number of lines to draw
    , length: 7             // The length of each line
    , width: 5              // The line thickness
    , radius: 10            // The radius of the inner circle
    , scale: 1.0            // Scales overall size of the spinner
    , corners: 1            // Roundness (0..1)
    , color: '#000'         // #rgb or #rrggbb
    , opacity: 1/4          // Opacity of the lines
    , rotate: 0             // Rotation offset
    , direction: 1          // 1: clockwise, -1: counterclockwise
    , speed: 1              // Rounds per second
    , trail: 100            // Afterglow percentage
    , fps: 20               // Frames per second when using setTimeout()
    , zIndex: 2e9           // Use a high z-index by default
    , className: 'spinner'  // CSS class to assign to the element
    , top: '50%'            // center vertically
    , left: '50%'           // center horizontally
    , shadow: false         // Whether to render a shadow
    , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
    , position: 'absolute'  // Element positioning
    }
    var target = document.getElementById('foo')
    var spinner = new Spinner(opts).spin(target)
 */

import React, { Component, PropTypes } from 'react'




/**
 * Creates an opacity keyframe animation rule and returns its name.
 * Since most mobile Webkits have timing issues with animation-delay,
 * we create separate rules for each line/segment.
 */
const addAnimation = (alpha, trail, i, lines) => {
  var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-')
    , start = 0.01 + i/lines * 100
    , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
    , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
    , pre = prefix && '-' + prefix + '-' || ''

  if (!animations[name]) {
    sheet.insertRule(`
@${pre}keyframes ${name}{
0%{opacity:${z}}
${start}%{opacity:${alpha}}
${start+0.01}%{opacity:1}
${(start+trail) % 100}%{opacity:${alpha}}
100%{opacity:${z}}
}`, sheet.cssRules.length)
    animations[name] = 1
  }

  return name
}


/**
 * Returns the line color from the given string or array.
 */
const getColor = (color, idx) => typeof color == 'string' ? color : color[idx % color.length]

  /**
   * Internal method that adjusts the opacity of a single line.
   * Will be overwritten in VML fallback mode below.
   */
const opacity = (el, i, val) => {
  if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
}


/** React component for segments */
const Segment = props => {
  const { style, children } = props
  const segmentStyle = { ...style, position: 'absolute' }
  return (
    <div style={segmentStyle} children={children} />
  )
}


/** React component to show during loading */
export default class Spinner extends Component {
  static defaultProps = { lines: 14             // The number of lines to draw
                        , length: 12            // The length of each line
                        , width: 8              // The line thickness
                        , radius: 20            // The radius of the inner circle
                        , scale: 1.0            // Scales overall size of the spinner
                        , corners: 1            // Roundness (0..1)
                        , color: '#f2c73d'      // #rgb or #rrggbb
                        , opacity: 1/4          // Opacity of the lines
                        , rotate: 0             // Rotation offset
                        , direction: 1          // 1: clockwise, -1: counterclockwise
                        , speed: 1              // Rounds per second
                        , trail: 100            // Afterglow percentage
                        , fps: 20               // Frames per second when using setTimeout()
                        , zIndex: 2e9           // Use a high z-index by default
                        , className: 'spinner'  // CSS class to assign to the element
                        , top: '50%'            // center vertically
                        , left: '50%'           // center horizontally
                        , shadow: false         // Whether to render a shadow
                        , hwaccel: false        // Whether to use hardware acceleration (might be buggy)
                        , position: 'absolute'  // Element positioning
                        };

  render() {
    const { position
          , zIndex
          , left
          , top
          , lines
          , direction
          , scale
          , length
          , width
          , corners
          , rotate
          , opacity
          , color
          , shadow
          } = this.props
    const containerStyle = { width: 0, position, zIndex, left, top }

    let start = (lines - 1) * (1 - direction) / 2

    const renderSegments = () => lines.map((x, i) => {
      const segmentStyle =  { top: 1 + ~(scale * width / 2)
                            , transform: hwaccel ? 'translate3d(0,0,0)' : ''
                            , opacity: opacity
                            , animation: addAnimation(opacity, trail, start + i * direction, lines) + ' ' + 1 / speed + 's linear infinite'
                            }
      const fillStyle = { top: shadow ? 2 : 0
                        , width: scale * (length + width)
                        , height: scale * width + 'px'
                        , background: shadow ? '#000' : getColor(color, i)
                        , boxShadow: shadow ? '0 0 4px #000' : '0 0 1px rgba(0,0,0,.1)'
                        , transformOrigin: 'left'
                        , transform: 'rotate(' + ~~(360/lines*i + rotate) + 'deg) translate(' + scale*radius + 'px' + ',0)'
                        , borderRadius: (corners * scale * width >> 1) + 'px'
                        }

      return <Segment style={segmentStyle}><Segment style={fillStyle} /></Segment>
    })
    return <div ref={x => this.container = x} style={style} role='progressbar'>{renderSegments()}</div>
  }
}

