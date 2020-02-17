$(document).ready(function() {
  $("#spawn-chatroom").click(function() {
    console.log("clicked");
    Chatroom();
  });
});
const credentials = {
  subscribeKey: "sub-c-024cb256-50ad-11ea-814d-0ecb550e9de2",//from pubnub
  publishKey: "pub-c-0c0771b1-bec3-4f71-8ae7-8f2194c26c1a",//from pubnub
  uuid: "1234654123",//anything
  ssl: true
};
var pubnub = new PubNub(credentials);

var Chatroom = function() {
  //using random function to distinguish new channel
  var id = Math.floor(Math.random() * Math.floor(100));
  var channel = "oo-chat-" + id;

  console.log("call to chatrrom at channel:", channel);
  //render variable 
  var $tpl = $(
    '\
      <div class="panel panel-default"> \
        <div class="panel-heading">Live Chat (' +
      channel +
      ')</div> \
        <ul class="list-group chat-output"></ul> \
        <div class="panel-body"> \
          <form> \
            <div class="input-group"> \
              <input type="text" class="form-control chat-input" /> \
              <span class="input-group-btn"> \
                <button  class="btn btn-default btn_send">Send Message</button> \
              </span> \
            </div> \
          </form> \
        </div> \
      </div> \
    '
  );

  var $form = $tpl.find("form");
  var $input = $form.find(".chat-input");
  var $output = $tpl.find(".chat-output");
  var render = function() {
    $("#chatrooms").append($tpl);
    console.log("call to render");

    $(".btn_send").click(function(e) {
      pubnub.publish(
        {
          channel: channel,
          message: $input.val()
        },
        function(status, response) {
          if (status.error) {
            // handle error
            console.log(status);
          } else {
            console.log("message Published w/ timetoken", response);
          }
        }
      );

      $input.val("");

      return false;
    });
  };
//first  function to run 
  (function() {
    pubnub.subscribe({
      channels: [channel],
      connect: render(),

      message: function(text) {
        console.log("subtext", text);
      }
    });
    pubnub.addListener({
      message: function(message) {
        // handle message
        console.log("message listened", message);
        var $line = $('<li class="list-group-item" >');
        var $message = $(
          '<span class="text" >' +
            message.message +
            "__from:" +
            message.channel +
            "</span></li/>"
        ).html();

        $line.append($message);
        $output.append($line);
        $output.scrollTop($output[0].scrollHeight);
      },
      presence: function(presenceEvent) {
        // handle presence
        console.log(presenceEvent);
      }
    });
  })();
};
