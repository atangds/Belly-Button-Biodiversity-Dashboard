function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  d3.json("/metadata/" + sample).then(data => {
    // Use d3 to select the panel with id of `#sample-metadata`
    let element = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    element.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(data).map(([key, value]) => element.append("p").text(`${key}: ${value}`));
    // BONUS: Build the Gauge Chart
    buildGauge(data.WFREQ);
  });
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  d3.json("/samples/" + sample).then(data => {
    // @TODO: Build a Bubble Chart using the sample data
    let trace1 = {
      x: data.otu_ids,
      y: data.sample_values,
      mode: "markers",
      marker: {
        color: data.otu_ids,
        colorscale: [[0, "blue"], [.5, "yellow"], [1, "brown"]],
        size: data.sample_values
      },
      hovertext: data.otu_labels
    };
    Plotly.newPlot("bubble", [trace1]);
    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    let data_array = [];
    for (i = 0; i < data.otu_ids.length; i++) {
      let obj = {
        "otu_id": data.otu_ids[i],
        "otu_label": data.otu_labels[i],
        "sample_value": data.sample_values[i]
      };
      data_array.push(obj);
    }
    data_array.sort((a, b) => b.sample_value - a.sample_value);
    data_array = data_array.slice(0, 10);
    let trace2 = {
      labels: data_array.map(obj => obj.otu_id),
      values: data_array.map(obj => obj.sample_value),
      hovertext: data_array.map(obj => obj.otu_label),
      type: "pie"
    };
    Plotly.newPlot("pie", [trace2]);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
