/**
 * @author tungtungxen@gmail.com
 * @version 0
 */

d3.gantt = function() {
    var FIT_TIME_DOMAIN_MODE = "fit",
        FIXED_TIME_DOMAIN_MODE = "fixed",
        margin = {
            top : 60,
            right : 0,
            bottom : 20,
            left : 0
        },
        selector = 'body',
        timeDomainStart = new Date(),
        timeDomainEnd = new Date(),
        timeDomainMode = FIT_TIME_DOMAIN_MODE, // fixed or fit
        tasks = [],
        taskStatus = [],
        taskColors = [],
        view = 'year',
        birthday = (new Date).getFullYear() - 20,
        onClick = function (d, i) { },
        height = 250,
        width = 1000,
        heightItem = 40,
        widthItem = 100,
        ticks = 10,
        paddingItemY = 0.5,
        x, y, xAxis, yAxis, svg, yGird, xGird, xAxisGird, ticksValue,
        tickFormat = "%Y";

    var keyFunction = function(d) {
        return d.startDate + d.taskName + d.endDate;
    };

    var rectTransform = function(d) {
        return "translate(" + x(d.startDate) + "," + (y(d.taskName) + y.bandwidth()*paddingItemY/2) + ")";
    };

    var textTransform = function(d) {
        return "translate(" + (x(d.startDate)+Math.max(1,(x(d.endDate) - x(d.startDate)))/2) + "," + (y(d.taskName) + y.bandwidth()/2 + 4) + ")";
    };
    var calculateTicks = function () {
        var w = d3.select(selector).node().clientWidth - margin.left - margin.right;
        ticks = timeDomainEnd.getFullYear() - timeDomainStart.getFullYear();
        if (ticks < (parseInt(w / widthItem) + 1)) {
            var t = Math.ceil(w / widthItem);
            var addTicks = Math.ceil((t - ticks) / 2);
            if (timeDomainEnd.getFullYear() + addTicks > (new Date).getFullYear()) {
                timeDomainStart =  new Date(timeDomainStart.getFullYear() - (t - ticks), 0, 1);
            } else if (timeDomainStart.getFullYear() - addTicks < 1900) {
                timeDomainEnd =  new Date(timeDomainEnd.getFullYear() + (t - ticks), 0, 1);
            } else {
                timeDomainStart =  new Date(timeDomainStart.getFullYear() - addTicks, 0, 1);
                timeDomainEnd =  new Date(timeDomainEnd.getFullYear() + addTicks, 0, 1);
            }
        }
        ticks = timeDomainEnd.getFullYear() - timeDomainStart.getFullYear();
        ticksValue = [];
        for(var i = 0; i < ticks; i++) {
            var date = new Date(timeDomainStart.getFullYear() + i, 6, 1);
            ticksValue[i] = date;
        }
    };
    var initTimeDomain = function(tasks) {
        if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
            if (tasks === undefined || tasks.length < 1) {
                timeDomainStart = new Date((new Date).getFullYear() - 10, 0, 1);
                timeDomainEnd = new Date((new Date).getFullYear() + 1, 0, 1);
                return;
            }
            tasks.sort(function(a, b) {
                return a.endDate - b.endDate;
            });
            timeDomainEnd = tasks[tasks.length - 1].endDate;
            tasks.sort(function(a, b) {
                return a.startDate - b.startDate;
            });
            timeDomainStart = tasks[0].startDate;
            timeDomainStart = new Date(timeDomainStart.getFullYear(), 0, 1);
            timeDomainEnd = new Date(timeDomainEnd.getFullYear() + 1, 0, 1);
            calculateTicks();
            width = ticks * widthItem;
            height = taskTypes.length * heightItem;
        }
    };
    // gridlines in x axis function
    var make_x_gridlines = function () {
        return d3.axisBottom(x).ticks(ticks)
    };

    var initAxis = function() {
        x = d3.scaleTime().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]);
        yGird = d3.scaleBand().domain(taskTypes).range([0, height]);
        y = d3.scaleBand().domain(taskTypes).range([0, height]);
        xAxis = d3.axisTop().scale(x).ticks(ticks).tickFormat(function (d) {
            let value = '';
            switch (view) {
                case 'year':
                    value = d3.timeFormat('%Y')(d);
                    break;
                case 'age':
                    value =  d.getFullYear() - birthday;
                    break;
            }
            return value;
        }).tickValues(ticksValue).tickPadding(10).tickSizeInner(0).tickSizeOuter(0);
        yAxis = d3.axisLeft().scale(y);
    };

    var drawGird = function () {
        // add the X gridlines
        svg.append("g")
            .attr("class", "x-grid")
            //.attr("transform", "translate(0," + height + ")")
            .call(make_x_gridlines()
                .tickSize(0).tickSizeOuter(0).tickSizeInner(height)
                .tickFormat("")
            );
        var data = [];
        for (var i = 0; i < taskTypes.length; i++) {
            data[i] = {
                "startDate": timeDomainStart,
                "endDate": timeDomainEnd,
                "taskName":taskTypes[i]
            }
        }
        // add the y gridlines
        var grid = svg.append("g").attr("class", "y-grid").selectAll('rect').data(data).enter()
            .append("rect").attr("transform", function(d) {
                return "translate(" + x(d.startDate) + "," + yGird(d.taskName) + ")";
            }).attr("height", function(d) { return yGird.bandwidth(); })
            .attr("stroke", '#ebeff2')
            .attr("stroke-width", '0.5')
            .attr("width", width).attr('stroke-dasharray', '' + width + ',' + heightItem + ',' + width + ',' + heightItem);
    };

    var draw = function() {
        initTimeDomain(tasks);
        initAxis();
        // svg = d3.select(selector)
        //     .append("svg")
        svg = svg.attr("class", "chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("class", "gantt-chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

        drawGird();

        var gs = svg.selectAll(".g-chart").data(tasks, keyFunction).enter().append("g")
            .attr('class', 'g-chart').on('click', onClick);

        gs.append("rect")
            .attr("rx", y.bandwidth()*(1 - paddingItemY)/2)
            .attr("ry", y.bandwidth()*(1 - paddingItemY)/2)
            .attr("transform", rectTransform)
            .attr("fill", function(d){
                if(taskColors[d.taskName] == null){ return "black";}
                return taskColors[d.taskName];
            })
            .attr("height", function(d) { return y.bandwidth()*(1 - paddingItemY); })
            .attr("width", function(d) {
                return Math.max(1,(x(d.endDate) - x(d.startDate)));
            });
        gs.append("text") // content of text will be defined later
            .attr("transform", textTransform)
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.name;
            });

        var elXAxis = svg.append("g");
        elXAxis.attr("class", "x-axis")
            .transition()
            .call(xAxis);
        elXAxis.append('rect').attr('height', 55).attr('y', -55)
            .attr('width', width).attr('style', 'stroke-width:1;stroke:#e0e0e0');
    };

    function gantt(tasksInput) {
        tasks = tasksInput;
        svg = d3.select(selector).append("svg");
        draw();
        return gantt;
    };

    gantt.redraw = function() {
        d3.select(selector).select('svg').selectAll("*").remove();
        svg = d3.select(selector).select("svg");
        draw();
        return gantt;
    };

    gantt.changeView = function(view) {
        switch (view) {
            case 'age':
                draw('age');
                break;
            case 'year':
                draw('year');
                break;
        }
    };

    gantt.margin = function(value) {
        if (!arguments.length)
            return margin;
        margin = value;
        return gantt;
    };

    gantt.timeDomain = function(value) {
        if (!arguments.length)
            return [ timeDomainStart, timeDomainEnd ];
        timeDomainStart = +value[0], timeDomainEnd = +value[1];
        return gantt;
    };

    /**
     * @param {string}
     *                vale The value can be "fit" - the domain fits the data or
     *                "fixed" - fixed domain.
     */
    gantt.timeDomainMode = function(value) {
        if (!arguments.length)
            return timeDomainMode;
        timeDomainMode = value;
        return gantt;

    };

    gantt.taskTypes = function(value) {
        if (!arguments.length)
            return taskTypes;
        taskTypes = value;
        return gantt;
    };

    gantt.taskStatus = function(value) {
        if (!arguments.length)
            return taskStatus;
        taskStatus = value;
        return gantt;
    };

    gantt.taskColors = function(value) {
        if (!arguments.length)
            return taskColors;
        taskColors = value;
        return gantt;
    };

    gantt.widthItem = function(value) {
        if (!arguments.length)
            return width;
        widthItem = +value;
        return gantt;
    };

    gantt.heightItem = function(value) {
        if (!arguments.length)
            return height;
        heightItem = +value;
        return gantt;
    };
    gantt.tickFormat = function(value) {
        if (!arguments.length)
            return tickFormat;
        tickFormat = value;
        return gantt;
    };

    gantt.selector = function(value) {
        if (!arguments.length)
            return selector;
        selector = value;
        return gantt;
    };

    gantt.onClick = function(value) {
        if (!arguments.length)
            return onClick;
        onClick = value;
        return gantt;
    };

    gantt.birthday = function(value) {
        if (!arguments.length)
            return birthday;
        birthday = value;
        return gantt;
    };

    gantt.view = function(value) {
        if (!arguments.length)
            return view;
        view = value;
        return gantt;
    };

    gantt.tasks = function(value) {
        if (!arguments.length)
            return view;
        tasks = value;
        return gantt;
    };

    return gantt;
};
