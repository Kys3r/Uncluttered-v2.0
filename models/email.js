const sgMail = require('@sendgrid/mail');
const { Logger } = require('mongodb');

let template = (title, message, link, messageButton) => {
	return (
		`
		<!DOCTYPE html
		  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml">
		
		<head>
		  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		  <title>[SUBJECT]</title>
		  <style type="text/css">
			body {
			  padding-top: 0 !important;
			  padding-bottom: 0 !important;
			  padding-top: 0 !important;
			  padding-bottom: 0 !important;
			  margin: 0 !important;
			  width: 100% !important;
			  -webkit-text-size-adjust: 100% !important;
			  -ms-text-size-adjust: 100% !important;
			  -webkit-font-smoothing: antialiased !important;
			}
			.tableContent img {
			  border: 0 !important;
			  display: block !important;
			  outline: none !important;
			}
			a {
			  color: #382F2E;
			}
			p,
			h1 {
			  color: #382F2E;
			  margin: 0;
			}
			p {
			  text-align: left;
			  color: #999999;
			  font-size: 14px;
			  font-weight: normal;
			  line-height: 19px;
			}
			a.link1 {
			  color: #382F2E;
			}
			a.link2 {
			  font-size: 16px;
			  text-decoration: none;
			  color: #ffffff;
			}
			h2 {
			  text-align: left;
			  color: #222222;
			  font-size: 19px;
			  font-weight: normal;
			}
			div,
			p,
			ul,
			h1 {
			  margin: 0;
			}
			.bgBody {
			  background: #c4c4c4;
			}
			.bgItem {
			  background: #ffffff;
			}
			.bg-theme {
			  background-color: #ff5100;
			}
			.bg-black {
			  background: rgb(22, 22, 22);
			  border-radius: 0px 0px 5px 5px;
			  box-shadow: 0 4px 8px 0 rgba(35, 35, 35, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
			}
			.shadows {
			  box-shadow: 0 4px 8px 0 rgba(35, 35, 35, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
			}
			.bg-rounded {
			  border-radius: 5px;
			}
			.padd {
			  padding: 1em;
			}
			.bg-bfc {
			  background: rgb(23, 23, 23);
			  background: linear-gradient(216deg, rgba(23, 23, 23, 1) 0%, rgba(34, 34, 34, 1) 71%, rgba(148, 90, 38, 1) 100%);
			}
			.light {
			  color: rgb(236, 236, 236);
			}
			.center {
			  display: block;
			  margin-left: auto;
			  margin-right: auto;
			}
			@media only screen and (max-width:480px) {
			  table[class="MainContainer"],
			  td[class="cell"] {
				width: 100% !important;
				height: auto !important;
			  }
			  td[class="specbundle"] {
				width: 100% !important;
				float: left !important;
				font-size: 13px !important;
				line-height: 17px !important;
				display: block !important;
				padding-bottom: 15px !important;
			  }
			  td[class="spechide"] {
				display: none !important;
			  }
			  img[class="banner"] {
				width: 100% !important;
				height: auto !important;
			  }
			  td[class="left_pad"] {
				padding-left: 15px !important;
				padding-right: 15px !important;
			  }
			}
			@media only screen and (max-width:540px) {
			  table[class="MainContainer"],
			  td[class="cell"] {
				width: 100% !important;
				height: auto !important;
			  }
			  td[class="specbundle"] {
				width: 100% !important;
				float: left !important;
				font-size: 13px !important;
				line-height: 17px !important;
				display: block !important;
				padding-bottom: 15px !important;
			  }
			  td[class="spechide"] {
				display: none !important;
			  }
			  img[class="banner"] {
				width: 100% !important;
				height: auto !important;
			  }
			  .font {
				font-size: 18px !important;
				line-height: 22px !important;
			  }
			  .font1 {
				font-size: 18px !important;
				line-height: 22px !important;
		
			  }
			}
		  </style>
		  <script type="colorScheme" class="swatch active">
		{
			"name":"Default",
			"bgBody":"ffffff",
			"link":"382F2E",
			"color":"999999",
			"bgItem":"ffffff",
			"title":"222222"
		}
		</script>
		</head>
		
		<body paddingwidth="0" paddingheight="0"
		  style="padding-top: 0; padding-bottom: 0; padding-top: 0; padding-bottom: 0; background-repeat: repeat; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased;"
		  offset="0" toppadding="0" leftpadding="0">
		  <table bgcolor="#F8F9FA" width="100%" border="0" cellspacing="0" cellpadding="0" class="tableContent" align="center"
			style='font-family:Helvetica, Arial,serif;'>
			<tbody>
			  <tr>
				<td>
				  <table width="600" border="0" cellspacing="0" cellpadding="0" align="center" class="MainContainer">
					<tbody>
					  <tr>
						<td>
						  <table width="100%" border="0" cellspacing="0" cellpadding="0">
							<tbody>
							  <tr>
								<td valign="top" width="40">&nbsp;</td>
								<td>
								  <table width="100%" border="0" cellspacing="0" cellpadding="0">
									<tbody>
									  <!-- =============================== Header ====================================== -->
									  <tr>
										<td height='75' class="spechide"></td>
										<!-- =============================== Body ====================================== -->
									  </tr>
									  <tr>
										<td class='movableContentContainer shadows bg-rounded' valign='top'>
										  <div class="movableContent"
											style="border: 0px; padding-top: 0px; position: relative;">
											<table width="100%" border="0" cellspacing="0" cellpadding="0">
											  <tbody>
												<tr>
												  <td height="35"></td>
												</tr>
												<tr>
												  <td>
													<table width="100%" border="0" cellspacing="0" cellpadding="0">
													  <tbody>
														<div class="contentEditable" style="margin-bottom: 1em">
														  <img src="https://buildfight.online/api/public/img/social/LOGObfc.png" class="center" width='80' height='auto'
															alt='twitter icon' data-default="placeholder" data-max-width="52"
															data-customIcon="true">
														</div>
														<tr>
														  <td valign="top" align="center" class="specbundle">
															<div class="contentEditableContainer contentTextEditable">
															  <div class="contentEditable">
																<p
																  style='text-align:center;margin:0;font-size:26px;color:#222222;font-weight: bold'>
																  <span class="specbundle2"><span class="font1">${'' + title + ''}</span></span></p>
															  </div>
															</div>
														  </td>
														</tr>
													  </tbody>
													</table>
												  </td>
												</tr>
											  </tbody>
											</table>
										  </div>
										  <div class="movableContent padd"
											style="border: 0px; padding-top: 0px; position: relative;">
											<table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
											  <tr>
												<td height='33'></td>
											  </tr>
											  <tr>
		
											  </tr>
		
											  <tr>
												<td height='15'> </td>
											  </tr>
		
											  <tr>
												<td align='left'>
												  <div class="contentEditableContainer contentTextEditable">
													<div class="contentEditable" align='center'>
													  <p>
													  ${'' + message + ''}
													  </p>
													</div>
												  </div>
												</td>
											  </tr>
											  <tr>
												<td height='20'></td>
											  </tr>
											  <tr>
												<td align='center'>
												  <table>
													<tr>
													  <td align='center' bgcolor='#289CDC' class="shadows"
														style='background:#ff7b00; padding:15px 18px;-webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px;'>
														<div class="contentEditableContainer contentTextEditable">
														  <div class="contentEditable " align='center'>
															<a target='_blank'
															  href="${'' + link + ''}" class='link2'
															  style='color:#ffffff;'>${'' + messageButton + ''}</a>
														  </div>
														</div>
													  </td>
													</tr>
												  </table>
												</td>
											  </tr>
											  <tr>
												<td height='20'></td>
											  </tr>
											</table>
										  </div>
										  <div class="movableContent bg-black padd"
											style="border: 0px; padding-top: 0px; position: relative; border-top: solid #ff9900;">
											<table width="100%" border="0" cellspacing="0" cellpadding="0">
											  <tbody>
												<tr>
												  <td height='40'>
												</tr>
												<p
												  style='text-align:center;margin-top:1.5em;font-size:26px;color:#f1f1f1;font-weight: bold'>
												  <span class="specbundle2"><span class="font1">Follow us</span></span></p>
												<tr>
												  <td>
													<table width="100%" border="0" cellspacing="0" cellpadding="0">
													  <tbody>
														<tr>
														  <td valign="top" width="30" class="specbundle">&nbsp;</td>
														  <td valign="top" class="specbundle">
															<table width="100%" border="0" cellspacing="0" cellpadding="0"
															  style="padding-left: 25px">
															  <tbody>
																<tr>
																  <td valign='top' width='52'>
																	<div
																	  class="contentEditableContainer contentFacebookEditable">
																	  <div class="contentEditable">
																		<a target='_blank'
																		  href="https://discord.gg/wHsnsnB"><img
																			src="https://buildfight.online/api/public/img/social/Discord.png" width='40' height='40'
																			alt='discord icon' data-default="placeholder"
																			data-max-width="52" data-customIcon="true"></a>
																	  </div>
																	</div>
																  </td>
																  <td valign='top' width='52'>
																	<div
																	  class="contentEditableContainer contentTwitterEditable">
																	  <div class="contentEditable">
																		<a target='_blank'
																		  href="https://twitter.com/BuildFightCom"><img
																			src="https://buildfight.online/api/public/img/social/Twitter.png" width='40' height='40'
																			alt='twitter icon' data-default="placeholder"
																			data-max-width="52" data-customIcon="true"></a>
																	  </div>
																	</div>
																  </td>
																  <td valign='top' width='52'>
																	<div
																	  class="contentEditableContainer contentTwitterEditable">
																	  <div class="contentEditable">
																		<a target='_blank'
																		  href="https://www.instagram.com/buildfight.official"><img
																			src="https://buildfight.online/api/public/img/social/Insta.png" width='40' height='40'
																			alt='instagram icon' data-default="placeholder"
																			data-max-width="52" data-customIcon="true"></a>
																	  </div>
																	</div>
																  </td>
																  <td valign='top' width='52'>
																	<div
																	  class="contentEditableContainer contentTwitterEditable">
																	  <div class="contentEditable">
																		<a target='_blank'
																		  href="https://www.youtube.com/channel/UCs6oK-8e0TUqvA9vRiu74zA"><img
																			src="https://buildfight.online/api/public/img/social/YTB.png" width='40' height='40'
																			alt='youtube icon' data-default="placeholder"
																			data-max-width="52" data-customIcon="true"></a>
																	  </div>
																	</div>
																  </td>
																</tr>
															  </tbody>
															</table>
														  </td>
														</tr>
													  </tbody>
													</table>
												  </td>
												</tr>
												<tr>
												  <td height='88'></td>
												</tr>
											  </tbody>
											</table>
											<div style="color: #c4c4c4">© Buildfight.com 2018</div>
										  </div>
										  <!-- =============================== footer ====================================== -->
										</td>
									  </tr>
									</tbody>
								  </table>
								</td>
								<td valign="top" width="40">&nbsp;</td>
							  </tr>
							</tbody>
						  </table>
						</td>
					  </tr>
					</tbody>
				  </table>
				</td>
			  </tr>
			</tbody>
		  </table>
		</body>
		</html>
		`
	)
}

module.exports =
{
	confirmAccountMail(to, token, language) {
		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
		let title = language == 'en' ? "Confirm your Buildfight.com account" : "Confirmez votre compte Buildfight.com"
		let message = language == 'en' ? "Welcome to Buildfight.com community !\n Please confirm your account with the following button.\n Enjoy it and stay fair ! :)" : "Bienvenu sur Buildfight.com !\n Merci de confirmer votre compte via le bouton suivant.\n Amusez-vous et restez fair play ! :)"
		let messageButton = language == 'en' ? "Confirm my account" : "Confirmer mon compte"
		let subject = language == 'en' ? "Account confirmation" : "Confirmation de compte"
		let link = String(process.env.DOMAIN + "/oauth/confirm-account/" + String(token))
		const msg = {
			to: to,
			from: 'contact@buildfight.com',
			subject: subject,
			html: template(title, message, link, messageButton)
		};
		let ret = (sgMail.send(msg)) ? true : false
		return ret
	},

	confirmChangingMail(to, token, language) {
		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
		let title = language == 'en' ? "Request to changing email adress" : "Demande de changement d'adresse email"
		let message = language == 'en' ? "You request to change your email adress.\n Use de following button to confirm your new email." : "Vous avez demandé le changement de votre adresse email.\n Utilisez le bouton suivant pour confirmer votre nouvelle adresse."
		let messageButton = language == 'en' ? "Confirm my new email" : "Confirmer mon nouvel email"
		let subject = language == 'en' ? "New email adress confirmation" : "Confirmation de votre nouvelle adresse email"
		let link = String(process.env.DOMAIN + "/users/confirm-email/" + String(token))
		const msg = {
			to: to,
			from: 'contact@buildfight.com',
			subject: subject,
			html: template(title, message, link, messageButton)
		};
		let ret = (sgMail.send(msg)) ? true : false
		return ret
	},

	resetPasswordMail(to, token, language) {
		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
		let title = language == 'en' ? "Reset your password" : "Réinitialisation de votre mot de passe"
		let message = language == 'en' ? "You request to reset your password.\n You just need to use the confirmation button and following instructions." : "Vous avez demandé la réinitialisation de votre mot de passe.\n Utilisez simplement le bouton suivant et suivez les instructions."
		let messageButton = language == 'en' ? "Reset my password" : "Réinitialiser mon mot de passe"
		let subject = language == 'en' ? "Password reset request" : "Demande de réinitialisation du mot de passe"
		let link = String(process.env.DOMAIN_CLIENT + "/new-password/" + String(token))
		const msg = {
			to: to,
			from: 'contact@buildfight.com',
			subject: subject,
			html: template(title, message, link, messageButton)
		};
		let ret = (sgMail.send(msg).then(() => {
			console.log('Email sent')
		})
			.catch((error) => {
				console.error(error)
			})) ? true : false
		return ret
	},

	groupMail(to, language) {
		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
		let title = language == 'en' ? "Road to the next generation of creative mode" : "En route vers la nouvelle génération du mode créatif"
		let message = language == 'en' ? "Because one deed is better than a thousand speeches...\n\nClick on the button right below and feel free to check out our latest tweets." : "Parce qu'un acte vaut mieux que mille discours...\n\nCliquez sur le bouton et n'hésitez pas à aller voir nos derniers tweets ;)"
		let messageButton = language == 'en' ? "Buildfight.com" : "Buildfight.com"
		let subject = language == 'en' ? "Buildfight.com V2 is back!" : "Buildfight.com V2 est de retour !"
		let link = String(process.env.DOMAIN_CLIENT)
		const msg = {
			to: to,
			from: 'contact@buildfight.com',
			subject: subject,
			html: template(title, message, link, messageButton)
		};
		let ret = (sgMail.send(msg)) ? true : false
		return ret
	},
}
