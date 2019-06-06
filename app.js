'use strict';

const Homey = require('homey');
const request = require('request');
const fs = require('fs');

class PiPupApp extends Homey.App {

	onInit() {
		this.log('PiPup is running...');

		this._onFlowActionSendNotificationJson = this._onFlowActionSendNotificationJson.bind(this);
		this._onFlowActionSendNotificationMultipart = this._onFlowActionSendNotificationMultipart.bind(this);

		// json

		new Homey.FlowCardAction('send_notification')
			.register()
			.registerRunListener(this._onFlowActionSendNotificationJson);

		new Homey.FlowCardAction('send_notification_media_image')
			.register()
			.registerRunListener(this._onFlowActionSendNotificationJson);

		new Homey.FlowCardAction('send_notification_media_video')
			.register()
			.registerRunListener(this._onFlowActionSendNotificationJson);

		new Homey.FlowCardAction('send_notification_media_web')
			.register()
			.registerRunListener(this._onFlowActionSendNotificationJson);

		// multipart

		new Homey.FlowCardAction('send_notification_image')
			.register()
			.registerRunListener(this._onFlowActionSendNotificationMultipart);			
	}

	async _onFlowActionSendNotificationJson(args) {

		let address = `http://${args.host}:7979/notify`;
		let jsonData = {
			duration: args.time,
			position: args.position,
			title: args.title.trim(),
			titleSize: args.titleSize,
			titleColor: args.titleColor,
			message: args.message.trim(),
			messageSize: args.messageSize,
			messageColor: args.messageColor,
			backgroundColor: args.backgroundColor
		};

		if(args.mediaImageUri) {
			jsonData["media"] = {
				"image": {
					"uri": args.mediaImageUri,
					"width": args.mediaImageWidth
				}
			}
		}

		if(args.mediaVideoUri) {
			jsonData["media"] = {
				"video": {
					"uri": args.mediaVideoUri,
					"width": args.mediaVideoWidth
				}
			}
		}

		if(args.mediaWebUri) {
			jsonData["media"] = {
				"web": {
					"uri": args.mediaWebUri,
					"width": args.mediaWebWidth,
					"height": args.mediaWebHeight
				}
			}
		}

		console.log(jsonData);
		console.log('sending notification to', address);

		request.post({ url: address, json: jsonData }, function optionalCallback(err, httpResponse, body) {
			if (err) {
				console.error('notification failed:', err);
				return false;
			}

			console.log('notification success');
			return true;
		});
	}

	async _onFlowActionSendNotificationMultipart(args) {

		let address = `http://${args.host}:7979/notify`;
		let formData = {
			imageWidth: args.imageWidth,
			duration: args.time,
			position: args.position,
			title: args.title.trim(),
			titleSize: args.titleSize,
			titleColor: args.titleColor,
			message: args.message.trim(),
			messageSize: args.messageSize,
			messageColor: args.messageColor,
			backgroundColor: args.backgroundColor
		};

		if (args.droptoken != null) {
			let stream = await args.droptoken.getStream();
			formData["image"] = {
				value: stream,
				options: {
					knownLength: stream.contentLength
				}
			};
		}

		console.log(formData);
		console.log('sending notification to', address);

		request.post({ url: address, formData: formData }, function optionalCallback(err, httpResponse, body) {
			if (err) {
				console.error('notification failed:', err);
				return false;
			}

			console.log('notification success');
			return true;
		});
	}

}

module.exports = PiPupApp;