tui.util.defineNamespace("fedoc.content", {});
fedoc.content["plugins_raphaelLineTypeBase.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview RaphaelLineTypeBase is base class for line type renderer.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar raphaelRenderUtil = require('./raphaelRenderUtil');\n\nvar ANIMATION_TIME = 700,\n    DEFAULT_DOT_RADIUS = 3,\n    HOVER_DOT_RADIUS = 4,\n    SELECTION_DOT_RADIUS = 7,\n    DE_EMPHASIS_OPACITY = 0.3;\n\nvar concat = Array.prototype.concat;\n\n/**\n * @classdesc RaphaelLineTypeBase is base for line type renderer.\n * @class RaphaelLineTypeBase\n */\nvar RaphaelLineTypeBase = tui.util.defineClass(/** @lends RaphaelLineTypeBase.prototype */ {\n    /**\n     * Make lines path.\n     * @param {Array.&lt;{left: number, top: number, startTop: number}>} positions positions\n     * @returns {Array.&lt;string | number>} paths\n     * @private\n     */\n    _makeLinesPath: function(positions) {\n        var path = tui.util.map(positions, function(position) {\n            return ['L', position.left, position.top];\n        });\n\n        path = concat.apply([], path);\n        path[0] = 'M';\n\n        return path;\n    },\n\n    /**\n     * Get anchor. (http://raphaeljs.com/analytics.js)\n     * @param {{left: number, top: number}} fromPos from position\n     * @param {{left: number, top: number}} pos position\n     * @param {{left: number, top: number}} nextPos next position\n     * @returns {{x1: number, y1: number, x2: number, y2: number}} anchor\n     * @private\n     */\n    _getAnchor: function(fromPos, pos, nextPos) {\n        var l1 = (pos.left - fromPos.left) / 2,\n            l2 = (nextPos.left - pos.left) / 2,\n            a = Math.atan((pos.left - fromPos.left) / Math.abs(pos.top - fromPos.top)),\n            b = Math.atan((nextPos.left - pos.left) / Math.abs(pos.top - nextPos.top)),\n            alpha, dx1, dy1, dx2, dy2;\n\n        a = fromPos.top &lt; pos.top ? Math.PI - a : a;\n        b = nextPos.top &lt; pos.top ? Math.PI - b : b;\n        alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2;\n        dx1 = l1 * Math.sin(alpha + a);\n        dy1 = l1 * Math.cos(alpha + a);\n        dx2 = l2 * Math.sin(alpha + b);\n        dy2 = l2 * Math.cos(alpha + b);\n\n        return {\n            x1: pos.left - dx1,\n            y1: pos.top + dy1,\n            x2: pos.left + dx2,\n            y2: pos.top + dy2\n        };\n    },\n\n    /**\n     * Make spline lines path.\n     * @param {Array.&lt;{left: number, top: number, startTop: number}>} positions positions\n     * @returns {Array.&lt;string | number>} paths\n     * @private\n     */\n    _makeSplineLinesPath: function(positions) {\n        var self = this,\n            firstPos = positions[0],\n            positionsLen = positions.length,\n            fromPos = firstPos,\n            lastPos = positions[positionsLen - 1],\n            middlePositions = positions.slice(1).slice(0, positionsLen - 2),\n            path = tui.util.map(middlePositions, function(position, index) {\n                var nextPos = positions[index + 2],\n                    anchor = self._getAnchor(fromPos, position, nextPos);\n                fromPos = position;\n                return [anchor.x1, anchor.y1, position.left, position.top, anchor.x2, anchor.y2];\n            });\n\n        firstPos.left -= 1;\n        path.push([lastPos.left, lastPos.top, lastPos.left, lastPos.top]);\n        path.unshift(['M', firstPos.left, firstPos.top, 'C', firstPos.left, firstPos.top]);\n\n        return path;\n    },\n\n    /**\n     * Render tooltip line.\n     * @param {object} paper raphael paper\n     * @param {number} height height\n     * @returns {object} raphael object\n     * @private\n     */\n    _renderTooltipLine: function(paper, height) {\n        var linePath = raphaelRenderUtil.makeLinePath({\n            left: 10,\n            top: height\n        }, {\n            left: 10,\n            top: 0\n        });\n\n        return raphaelRenderUtil.renderLine(paper, linePath, 'transparent', 1);\n    },\n\n    /**\n     * Make border style.\n     * @param {string} borderColor border color\n     * @param {number} opacity opacity\n     * @returns {{stroke: string, stroke-width: number, strike-opacity: number}} border style\n     */\n    makeBorderStyle: function(borderColor, opacity) {\n        var borderStyle;\n\n        if (borderColor) {\n            borderStyle = {\n                stroke: borderColor,\n                'stroke-width': 1,\n                'stroke-opacity': opacity\n            };\n        }\n\n        return borderStyle;\n    },\n\n    /**\n     * Make dot style for mouseout event.\n     * @param {number} opacity opacity\n     * @param {object} borderStyle border style\n     * @returns {{fill-opacity: number, stroke-opacity: number, r: number}} style\n     */\n    makeOutDotStyle: function(opacity, borderStyle) {\n        var outDotStyle = {\n            'fill-opacity': opacity,\n            'stroke-opacity': 0,\n            r: DEFAULT_DOT_RADIUS\n        };\n\n        if (borderStyle) {\n            tui.util.extend(outDotStyle, borderStyle);\n        }\n\n        return outDotStyle;\n    },\n\n    /**\n     * Render dot.\n     * @param {object} paper raphael papaer\n     * @param {{left: number, top: number}} position dot position\n     * @param {string} color dot color\n     * @param {number} opacity opacity\n     * @returns {object} raphael dot\n     */\n    renderDot: function(paper, position, color, opacity) {\n        var dot = paper.circle(position.left, position.top, DEFAULT_DOT_RADIUS),\n            dotStyle = {\n                fill: color,\n                'fill-opacity': opacity,\n                'stroke-opacity': 0\n            };\n\n        dot.attr(dotStyle);\n\n        return {\n            dot: dot,\n            color: color\n        };\n    },\n\n    /**\n     * Render dots.\n     * @param {object} paper raphael paper\n     * @param {Array.&lt;Array.&lt;object>>} groupPositions positions\n     * @param {string[]} colors colors\n     * @param {number} opacity opacity\n     * @returns {Array.&lt;object>} dots\n     * @private\n     */\n    _renderDots: function(paper, groupPositions, colors, opacity) {\n        var self = this,\n            dots = tui.util.map(groupPositions, function(positions, groupIndex) {\n                var color = colors[groupIndex];\n                return tui.util.map(positions, function(position) {\n                    var dot = self.renderDot(paper, position, color, opacity);\n                    return dot;\n                });\n            });\n\n        return dots;\n    },\n\n    /**\n     * Get center position\n     * @param {{left: number, top: number}} fromPos from position\n     * @param {{left: number, top: number}} toPos to position\n     * @returns {{left: number, top: number}} position\n     * @private\n     */\n    _getCenter: function(fromPos, toPos) {\n        return {\n            left: (fromPos.left + toPos.left) / 2,\n            top: (fromPos.top + toPos.top) / 2\n        };\n    },\n\n    /**\n     * Show dot.\n     * @param {object} dot raphael object\n     * @private\n     */\n    _showDot: function(dot) {\n        dot.attr({\n            'fill-opacity': 1,\n            'stroke-opacity': 0.3,\n            'stroke-width': 2,\n            r: HOVER_DOT_RADIUS\n        });\n    },\n\n    /**\n     * Update line stroke width.\n     * @param {object} line raphael object\n     * @param {number} strokeWidth stroke width\n     * @private\n     */\n    _updateLineStrokeWidth: function(line, strokeWidth) {\n        line.attr({\n            'stroke-width': strokeWidth\n        });\n    },\n\n    /**\n     * Show animation.\n     * @param {{groupIndex: number, index:number}} data show info\n     */\n    showAnimation: function(data) {\n        var index = data.groupIndex, // Line chart has pivot values.\n            groupIndex = data.index,\n            line = this.groupLines ? this.groupLines[groupIndex] : this.groupAreas[groupIndex].line,\n            item = this.groupDots[groupIndex][index],\n            strokeWidth = 3;\n\n        this._updateLineStrokeWidth(line, strokeWidth);\n        this._showDot(item.dot);\n    },\n\n    /**\n     * Get pivot group dots.\n     * @returns {Array.&lt;Array>} dots\n     * @private\n     */\n    _getPivotGroupDots: function() {\n        if (!this.pivotGroupDots) {\n            this.pivotGroupDots = tui.util.pivot(this.groupDots);\n        }\n\n        return this.pivotGroupDots;\n    },\n\n    /**\n     * Show group dots.\n     * @param {number} index index\n     * @private\n     */\n    _showGroupDots: function(index) {\n        var self = this,\n            groupDots = this._getPivotGroupDots();\n\n        tui.util.forEachArray(groupDots[index], function(item) {\n            self._showDot(item.dot);\n        });\n    },\n\n    /**\n     * Show line for group tooltip.\n     * @param {{\n     *      dimension: {width: number, height: number},\n     *      position: {left: number, top: number}\n     * }} bound bound\n     */\n    showGroupTooltipLine: function(bound) {\n        var linePath = raphaelRenderUtil.makeLinePath({\n            left: bound.position.left,\n            top: bound.position.top + bound.dimension.height\n        }, {\n            left: bound.position.left,\n            top: bound.position.top\n        });\n\n        this.tooltipLine.attr({\n            path: linePath,\n            stroke: '#999',\n            'stroke-opacity': 1\n        });\n    },\n\n    /**\n     * Show group animation.\n     * @param {number} index index\n     */\n    showGroupAnimation: function(index) {\n        this._showGroupDots(index);\n    },\n\n    /**\n     * Hide dot.\n     * @param {object} dot raphael object\n     * @param {?number} opacity opacity\n     * @private\n     */\n    _hideDot: function(dot, opacity) {\n        var outDotStyle = this.outDotStyle;\n\n        if (!tui.util.isUndefined(opacity)) {\n            outDotStyle = tui.util.extend({}, this.outDotStyle, {\n                'fill-opacity': opacity\n            });\n        }\n\n        dot.attr(outDotStyle);\n    },\n\n    /**\n     * Hide animation.\n     * @param {{groupIndex: number, index:number}} data hide info\n     */\n    hideAnimation: function(data) {\n        var index = data.groupIndex, // Line chart has pivot values.\n            groupIndex = data.index,\n            line = this.groupLines ? this.groupLines[groupIndex] : this.groupAreas[groupIndex].line,\n            item = this.groupDots[groupIndex][index],\n            opacity = this.dotOpacity,\n            strokeWidth = 2;\n\n        if (opacity &amp;&amp; !tui.util.isNull(this.selectedLegendIndex) &amp;&amp; this.selectedLegendIndex !== groupIndex) {\n            opacity = DE_EMPHASIS_OPACITY;\n        }\n\n        if (line) {\n            this._updateLineStrokeWidth(line, strokeWidth);\n        }\n\n        if (item) {\n            this._hideDot(item.dot, opacity);\n        }\n    },\n\n    /**\n     * Hide group dots.\n     * @param {number} index index\n     * @private\n     */\n    _hideGroupDots: function(index) {\n        var self = this,\n            dots = this._getPivotGroupDots(),\n            hasSelectedIndex = !tui.util.isNull(this.selectedLegendIndex),\n            baseOpacity = this.dotOpacity;\n\n        tui.util.forEachArray(dots[index], function(item, groupIndex) {\n            var opacity = baseOpacity;\n\n            if (opacity &amp;&amp; hasSelectedIndex &amp;&amp; self.selectedLegendIndex !== groupIndex) {\n                opacity = DE_EMPHASIS_OPACITY;\n            }\n\n            self._hideDot(item.dot, opacity);\n        });\n    },\n\n    /**\n     * Hide line for group tooltip.\n     */\n    hideGroupTooltipLine: function() {\n        this.tooltipLine.attr({\n            'stroke-opacity': 0\n        });\n    },\n\n    /**\n     * Hide group animation.\n     * @param {number} index index\n     */\n    hideGroupAnimation: function(index) {\n        this._hideGroupDots(index);\n    },\n\n    _moveDot: function(dot, position) {\n        var dotAttrs = {\n            cx: position.left,\n            cy: position.top\n        };\n\n        if (this.dotOpacity) {\n            dotAttrs = tui.util.extend({'fill-opacity': this.dotOpacity}, dotAttrs, this.borderStyle);\n        }\n\n        dot.attr(dotAttrs);\n    },\n\n    /**\n     * Animate.\n     * @param {function} onFinish callback\n     */\n    animate: function(onFinish) {\n        var self = this,\n            seriesWidth = this.dimension.width,\n            seriesHeight = this.dimension.height;\n\n        tui.chart.renderUtil.cancelAnimation(this.animation);\n\n        this.animation = tui.chart.renderUtil.startAnimation(ANIMATION_TIME, function(ratio) {\n            var width = Math.min(seriesWidth * ratio, seriesWidth);\n\n            self.paper.setSize(width, seriesHeight);\n\n            if (ratio === 1) {\n                onFinish();\n            }\n        });\n    },\n\n    /**\n     * Make selection dot.\n     * @param {object} paper raphael paper\n     * @returns {object} selection dot\n     * @private\n     */\n    _makeSelectionDot: function(paper) {\n        var selectionDot = paper.circle(0, 0, SELECTION_DOT_RADIUS);\n\n        selectionDot.attr({\n            'fill': '#ffffff',\n            'fill-opacity': 0,\n            'stroke-opacity': 0,\n            'stroke-width': 2\n        });\n        return selectionDot;\n    },\n\n    /**\n     * Select series.\n     * @param {{groupIndex: number, index: number}} indexes indexes\n     */\n    selectSeries: function(indexes) {\n        var item = this.groupDots[indexes.index][indexes.groupIndex],\n            position = this.groupPositions[indexes.index][indexes.groupIndex];\n\n        this.selectedItem = item;\n        this.selectionDot.attr({\n            cx: position.left,\n            cy: position.top,\n            'fill-opacity': 0.5,\n            'stroke-opacity': 1,\n            stroke: this.selectionColor || item.color\n        });\n    },\n\n    /**\n     * Unselect series.\n     * @param {{groupIndex: number, index: number}} indexes indexes\n     */\n    unselectSeries: function(indexes) {\n        var item = this.groupDots[indexes.index][indexes.groupIndex];\n\n        if (this.selectedItem === item) {\n            this.selectionDot.attr({\n                'fill-opacity': 0,\n                'stroke-opacity': 0\n            });\n        }\n    }\n});\n\nmodule.exports = RaphaelLineTypeBase;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"