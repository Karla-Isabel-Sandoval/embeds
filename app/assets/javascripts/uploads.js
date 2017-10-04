
$(document).on("turbolinks:load", function() {

  $("[type=file]").fileupload({
    sequentialUploads: true,

    add: function(e, data) {
      console.log("add", data);
      data.progressBar = buildFileRow(data);
      console.log(data.progressBar);

      
      var options      = {
        extension: data.files[0].name.match(/(\.\w+)?$/)[0], // set the file extension
        _: Date.now() // prevent caching
      };

      $.getJSON("/clips/presign", options, function(result) {
        console.log("presign", result);
        data.formData  = result.fields;
        data.url       = result.url;
        data.paramName = "file";
        data.submit();
      });
    },

    progress: function(e, data) {
      // console.log("progress", data);
      var progress   = parseInt(data.loaded / data.total * 100, 10);
      var percentage = progress.toString() + '%';
      data.progressBar.find(".progress-bar").css("width", percentage).html(percentage);
    },

    done: function(e, data) {
      console.log("done", data);
      // data.progressBar.remove();


      var clip = {
        id:       data.formData.key, // we have to remove the prefix part
        storage:  'cache',
        metadata: {
          size:      data.files[0].size,
          filename:  data.files[0].name.match(/[^\/\\]+$/)[0], // IE return full path
          mime_type: data.files[0].type
        }
      };

      var form = $(this).closest("form");
   

      var formData = new FormData(form[0]);
      formData.append($(this).attr("name"), JSON.stringify(clip));
      formData.append("video[title]", clip.metadata.filename);
      console.log(clip.metadata.filename);
      

      $.ajax(form.attr("action"), {
        contentType: false,
        processData: false,
        data:        formData,
        method:      form.attr("method"),
        dataType:    "json",
        success: function(response) {
          console.log("response", response);

        }
      });
    }
  });

  function buildFileRow(data) {
    var fileName = data.files[0].name;
    var listItem = $('<li class="list-group-item"></li>');
    listItem.html(fileName);
    var bar = $(`<div class="progress" style="width: 300px"><div class="progress-bar"></div></div>`);
    listItem.append(bar);
    $("#videos").append(listItem);
    return bar;
  }


});