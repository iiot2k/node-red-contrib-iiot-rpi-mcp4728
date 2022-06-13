/**
 * Copyright 2022 Ocean (iiot2k@gmail.com).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

"use strict";

module.exports = function(RED) {
	const syslib = require("./lib/syslib.js");
	const sysmodule = syslib.LoadModule("rpi_mcp4728");

    RED.nodes.registerType("mcp4728", function(n) {
		var node = this;
		RED.nodes.createNode(node, n);

		node.channel = parseInt(n.channel);
		node.gain = parseInt(n.gain);
		node.iserror = false;
		node.init = n.init;
		node.name = this.name || "mcp4728 @60#" + String.fromCharCode(65 + node.channel);

		if (sysmodule === undefined)
			node.iserror = syslib.outError(node, "driver error", "driver not load, wrong os or not Raspi");
		else if (!sysmodule.open())
			node.iserror = syslib.outError(node, "open error", "i2c port not open, check i2c");
		else if (!sysmodule.write(node.init, node.channel, node.gain))
			syslib.outError(node, "write error", "device not write, check i2c and device");
		else
			syslib.outText(node, node.init);

		node.on("input", function (msg) {
			if (node.iserror)
				return;

			if (typeof msg.payload !== "number") {
				syslib.outError(node, "not number", "msg.payload not number");
				return;
			}
			else {
				if (msg.payload < 0)
					msg.payload = 0;
				else if (msg.payload > 4095)
					msg.payload = 4095;
				syslib.outText(node, msg.payload);
			}

			if (!sysmodule.write(msg.payload, node.channel, node.gain))
				syslib.outError(node, "write error", "device not write, check i2c and device");
		});
	});
}
