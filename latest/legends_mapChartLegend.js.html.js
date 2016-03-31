tui.util.defineNamespace("fedoc.content", {});
fedoc.content["legends_mapChartLegend.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview  Legend component for map chart.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar chartConst = require('../const'),\n    predicate = require('../helpers/predicate'),\n    dom = require('../helpers/domHandler'),\n    renderUtil = require('../helpers/renderUtil'),\n    pluginFactory = require('../factories/pluginFactory'),\n    legendTemplate = require('./../legends/legendTemplate');\n\nvar MapChartLegend = tui.util.defineClass(/** @lends MapChartLegend.prototype */ {\n    /**\n     * Legend component for map chart.\n     * @constructs MapChartLegend\n     * @param {object} params parameters\n     *      @param {object} params.theme axis theme\n     *      @param {?Array.&lt;string>} params.options legend options\n     *      @param {MapChartDataProcessor} params.dataProcessor data processor\n     *      @param {BoundsMaker} params.boundsMaker bounds maker\n     */\n    init: function(params) {\n        var libType = params.libType || chartConst.DEFAULT_PLUGIN;\n\n        /**\n         * class name.\n         * @type {string}\n         */\n        this.className = 'tui-chart-legend-area';\n\n        /**\n         * legend theme\n         * @type {Object}\n         */\n        this.theme = params.theme;\n\n        /**\n         * options\n         * @type {object}\n         */\n        this.options = params.options || {};\n\n        /**\n         * data processor\n         * @type {DataProcessor}\n         */\n        this.dataProcessor = params.dataProcessor;\n\n        /**\n         * bounds maker\n         * @type {BoundsMaker}\n         */\n        this.boundsMaker = params.boundsMaker;\n\n        /**\n         * Graph renderer\n         * @type {object}\n         */\n        this.graphRenderer = pluginFactory.get(libType, 'mapLegend');\n\n        /**\n         * Whether horizontal legend or not.\n         * @type {boolean}\n         */\n        this.isHorizontal = predicate.isHorizontalLegend(this.options.align);\n    },\n\n    /**\n     * Make vertical legend dimension.\n     * @returns {{width: number, height: number}} dimension\n     * @private\n     */\n    _makeVerticalDimension: function() {\n        var maxValue = Math.max.apply(null, this.dataProcessor.getValues()),\n            formatFunctions = this.dataProcessor.getFormatFunctions(),\n            valueStr = renderUtil.formatValue(maxValue, formatFunctions),\n            labelWidth = renderUtil.getRenderedLabelWidth(valueStr, this.theme.label),\n            padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;\n\n        return {\n            width: chartConst.MAP_LEGEND_GRAPH_SIZE + labelWidth + padding,\n            height: chartConst.MAP_LEGEND_SIZE\n        };\n    },\n\n    /**\n     * Make horizontal legend dimension\n     * @returns {{width: number, height: number}} dimension\n     * @private\n     */\n    _makeHorizontalDimension: function() {\n        var maxValue = Math.max.apply(null, this.dataProcessor.getValues()),\n            labelHeight = renderUtil.getRenderedLabelHeight(maxValue, this.theme.label),\n            padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;\n\n        return {\n            width: chartConst.MAP_LEGEND_SIZE,\n            height: chartConst.MAP_LEGEND_GRAPH_SIZE + labelHeight + padding\n        };\n    },\n\n    /**\n     * Register dimension.\n     */\n    registerDimension: function() {\n        var dimension;\n\n        if (this.isHorizontal) {\n            dimension = this._makeHorizontalDimension();\n        } else {\n            dimension = this._makeVerticalDimension();\n        }\n\n        this.boundsMaker.registerBaseDimension('legend', dimension);\n    },\n\n    /**\n     * Make base data to make tick html.\n     * @returns {{startPositionValue: number, step: number, positionType: string, labelSize: ?number}} base data\n     * @private\n     */\n    _makeBaseDataToMakeTickHtml: function() {\n        var dimension = this.boundsMaker.getDimension('legend'),\n            stepCount = this.axesData.tickCount - 1,\n            baseData = {},\n            firstLabel;\n\n        if (this.isHorizontal) {\n            baseData.startPositionValue = 5;\n            baseData.step = dimension.width / stepCount;\n            baseData.positionType = 'left:';\n        } else {\n            baseData.startPositionValue = 0;\n            baseData.step = dimension.height / stepCount;\n            baseData.positionType = 'top:';\n            firstLabel = this.axesData.labels[0];\n            baseData.labelSize = parseInt(renderUtil.getRenderedLabelHeight(firstLabel, this.theme.label) / 2, 10) - 1;\n        }\n\n        return baseData;\n    },\n    /**\n     * Make tick html.\n     * @returns {string} tick html.\n     * @private\n     */\n    _makeTickHtml: function() {\n        var self = this,\n            baseData = this._makeBaseDataToMakeTickHtml(),\n            positionValue = baseData.startPositionValue,\n            htmls;\n\n        htmls = tui.util.map(this.axesData.labels, function(label) {\n            var labelSize, html;\n\n            if (self.isHorizontal) {\n                labelSize = parseInt(renderUtil.getRenderedLabelWidth(label, self.theme.label) / 2, 10);\n            } else {\n                labelSize = baseData.labelSize;\n            }\n\n            html = legendTemplate.tplTick({\n                position: baseData.positionType + positionValue + 'px',\n                labelPosition: baseData.positionType + (positionValue - labelSize) + 'px',\n                label: label\n            });\n\n            positionValue += baseData.step;\n            return html;\n        });\n\n        return htmls.join('');\n    },\n\n    /**\n     * Render tick area.\n     * @returns {HTMLElement} tick countainer\n     * @private\n     */\n    _renderTickArea: function() {\n        var tickContainer = dom.create('div', 'tui-chart-legend-tick-area');\n\n        tickContainer.innerHTML = this._makeTickHtml();\n\n        if (this.isHorizontal) {\n            dom.addClass(tickContainer, 'horizontal');\n        }\n        return tickContainer;\n    },\n\n    /**\n     * Make graph dimension of vertical legend\n     * @returns {{width: number, height: number}} dimension\n     * @private\n     */\n    _makeVerticalGraphDimension: function() {\n        return {\n            width: chartConst.MAP_LEGEND_GRAPH_SIZE,\n            height: this.boundsMaker.getDimension('legend').height\n        };\n    },\n\n    /**\n     * Make graph dimension of horizontal legend\n     * @returns {{width: number, height: number}} dimension\n     * @private\n     */\n    _makeHorizontalGraphDimension: function() {\n        return {\n            width: this.boundsMaker.getDimension('legend').width + 10,\n            height: chartConst.MAP_LEGEND_GRAPH_SIZE\n        };\n    },\n\n    /**\n     * Render graph.\n     * @param {HTMLElement} container container element\n     * @private\n     */\n    _renderGraph: function(container) {\n        var dimension;\n\n        if (this.isHorizontal) {\n            dimension = this._makeHorizontalGraphDimension();\n        } else {\n            dimension = this._makeVerticalGraphDimension();\n        }\n\n        this.graphRenderer.render(container, dimension, this.colorModel, this.isHorizontal);\n    },\n\n    /**\n     * Render legend area.\n     * @param {HTMLElement} container legend container\n     * @private\n     */\n    _renderLegendArea: function(container) {\n        var tickContainer;\n\n        container.innerHTML = '';\n        renderUtil.renderPosition(container, this.boundsMaker.getPosition('legend'));\n        this._renderGraph(container);\n        tickContainer = this._renderTickArea();\n        container.appendChild(tickContainer);\n        container.style.cssText += ';' + renderUtil.makeFontCssText(this.theme.label);\n    },\n\n    /**\n     * Render legend component.\n     * @param {{colorModel: MapChartColorModel, axesData: object}} data rendering data\n     * @returns {HTMLElement} legend element\n     */\n    render: function(data) {\n        var container = dom.create('DIV', this.className);\n\n        this.legendContainer = container;\n        this.colorModel = data.colorModel;\n        this.axesData = data.axesData;\n        this._renderLegendArea(container);\n\n        return container;\n    },\n\n    /**\n     * Resize legend component.\n     */\n    resize: function() {\n        this._renderLegendArea(this.legendContainer);\n    },\n\n    /**\n     * On show wedge.\n     * @param {number} ratio ratio\n     */\n    onShowWedge: function(ratio) {\n        this.graphRenderer.showWedge(chartConst.MAP_LEGEND_SIZE * ratio);\n    },\n\n    /**\n     * On hide wedge.\n     */\n    onHideWedge: function() {\n        this.graphRenderer.hideWedge();\n    }\n});\n\ntui.util.CustomEvents.mixin(MapChartLegend);\n\nmodule.exports = MapChartLegend;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"