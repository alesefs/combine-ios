//
//  ViewController.swift
//  Combine
//
//  Created by Alessandro on 06/06/2018.
//  Copyright © 2018 alesefs. All rights reserved.
//

import Firebase
import UIKit
import GoogleMobileAds
import AudioToolbox
import Foundation
import AVFoundation
import GameKit

class ViewController: UIViewController, UIWebViewDelegate, GKGameCenterControllerDelegate, GADBannerViewDelegate, GADInterstitialDelegate, GADRewardBasedVideoAdDelegate {

    @IBOutlet var webView: UIWebView!
    var urlpath = Bundle.main.path(forResource: "www/index", ofType: "html")
    
    @IBOutlet var imageView: UIImageView!
    var screenSize: CGRect = UIScreen.main.bounds
    
    //send to JS focus/online
    var isFocus = NSString()
    var onOnLine = NSString()
    
    
    //send to SWIFT
    var BGSplayer: AVAudioPlayer?
    var bg_snd = NSString()
    var numSound = 0
    
    
    var FXS0player: AVAudioPlayer?
    var FXS1player: AVAudioPlayer?
    var FXS2player: AVAudioPlayer?
    var FXS3player: AVAudioPlayer?
    var fx_snd = NSString()
    var numEffects = 0
    
    var isEffects = Bool()
    var isSound = Bool()
    var isPaused = Bool()
    var isRewarded = Bool()
    
    var data = Data()
    var hiscore = NSString()
    
    var txtReward = NSString()
    var numReward = 0
    
    var interTxt = NSString()
    var numInter = 0
    
    var txtFocus = NSString()
    var numFocus = 0
    var txtNumFocus = NSString()
    
    
    // Ad banner and interstitial views
    var adMobBannerView = GADBannerView()
    var interstitial: GADInterstitial?
    // IMPORTANT: REPLACE THE RED STRING BELOW WITH THE AD UNIT ID YOU'VE GOT BY REGISTERING YOUR APP IN http://apps.admob.com
    
    //app admob id
    let ADMOB_APP_ID = "ca-app-pub-2504391267856791~7870043550"
    //let ADMOB_APP_ID = "ca-app-pub-3940256099942544~1458002511"//aux
    //banner ID
    let ADMOB_BANNER_UNIT_ID = "ca-app-pub-2504391267856791/1304635206"
    //let ADMOB_BANNER_UNIT_ID = "ca-app-pub-3940256099942544/2934735716"//aux
    //intertitial ID
    let ADMOB_INTERSTITIAL_UNIT_ID = "ca-app-pub-2504391267856791/3547655163"
    //let ADMOB_INTERSTITIAL_UNIT_ID = "ca-app-pub-3940256099942544/4411468910"//aux
    //reward ID
    let ADMOB_REWARD_UNIT_ID = "ca-app-pub-2504391267856791/6188176663"
    //let ADMOB_REWARD_UNIT_ID = "ca-app-pub-3940256099942544/1712485313"//aux
    
    //video reward
    var rewardBasedVideo: GADRewardBasedVideoAd?
    
    /* Variables Leaderboard*/
    var gcEnabled = Bool()  // Check if the user has Game Center enabled
    var gcDefaultLeaderBoard = String()  // Check the default leaderboardID
    // IMPORTANT: replace the red string below with your own Leaderboard ID (the one you've set in iTunes Connect)
    let LEADERBOARD_ID = "apps.alesefs.com.Combine.rank"
    var numHiScore = 0
    var hiScore = NSString()
    
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
    }
    
    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
    }
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        //print("TAPPLE-viewDidLoad")
        // Do any additional setup after loading the view, typically from a nib.
        
        let img : UIImage = UIImage(named: "Splash")!
        let screenWidth = screenSize.width
        let screenHeight = screenSize.height
        imageView = UIImageView(image: img)
        imageView.frame = CGRect(x: 0, y: 0, width: screenWidth, height: screenHeight)
        view.addSubview(imageView)
        //imageView.isHidden = false
        
        let requesturl = URL(string: urlpath!)
        let request = URLRequest(url: requesturl!)
        
        webView.delegate = self
        webView.loadRequest(request)
        webView.isOpaque = false
        webView.backgroundColor = UIColor.clear
        
        //ativar som
        webView.mediaPlaybackRequiresUserAction = false
        webView.allowsInlineMediaPlayback = true
        
        
        //franja do iphone X
        webView.translatesAutoresizingMaskIntoConstraints = false
        if #available(iOS 11.0, *) {
            let guide = self.view.safeAreaLayoutGuide
            
            webView.trailingAnchor.constraint(equalTo: guide.trailingAnchor).isActive = true
            webView.leadingAnchor.constraint(equalTo: guide.leadingAnchor).isActive = true
            NSLayoutConstraint(item: webView, attribute: .bottom, relatedBy: .equal, toItem: view, attribute: .bottom, multiplier: 1.0, constant: 0).isActive = true//no bottom safe
            NSLayoutConstraint(item: webView, attribute: .top, relatedBy: .equal, toItem: view, attribute: .top, multiplier: 1.0, constant: 0).isActive = true//no top safe
            
        } else {
            NSLayoutConstraint(item: webView, attribute: .leading, relatedBy: .equal, toItem: view, attribute: .leading, multiplier: 1.0, constant: 0).isActive = true
            NSLayoutConstraint(item: webView, attribute: .trailing, relatedBy: .equal, toItem: view, attribute: .trailing, multiplier: 1.0, constant: 0).isActive = true
            NSLayoutConstraint(item: webView, attribute: .bottom, relatedBy: .equal, toItem: view, attribute: .bottom, multiplier: 1.0, constant: 0).isActive = true
            NSLayoutConstraint(item: webView, attribute: .top, relatedBy: .equal, toItem: view, attribute: .top, multiplier: 1.0, constant: 0).isActive = true
        }
        
        //pausar o jogo e sons quando o jogo nao for o foco
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applicationWillTerminate(_:)),
            name: NSNotification.Name.UIApplicationWillTerminate,
            object: nil)
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applicationWillResignActive(_:)),
            name: NSNotification.Name.UIApplicationWillResignActive,
            object: nil)
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(applicationDidBecomeActive(_:)),
            name: NSNotification.Name.UIApplicationDidBecomeActive,
            object: nil)
        
        // Call the GC authentication controller
        authenticateLocalPlayer()
        
        // Init AdMob banner
        initAdMobBanner()
        
        // video reward
        rewardBasedVideo = GADRewardBasedVideoAd.sharedInstance()
        rewardBasedVideo?.delegate = self
        
        
        //BGMusic
        let bgurl = Bundle.main.url(forResource: "raw/combine_bg_sound", withExtension: "mp3")!
        do {
            BGSplayer = try AVAudioPlayer(contentsOf: bgurl)
            BGSplayer?.numberOfLoops = -1
        } catch {
            //deu ruim
        }
        
        
        //FX connect = 0
        let fx0url = Bundle.main.url(forResource: "raw/combine_connect", withExtension: "mp3")!
        do {
            FXS0player = try AVAudioPlayer(contentsOf: fx0url)
            FXS0player?.numberOfLoops = 0
        } catch {
            //deu ruim
        }
        
        //FX end Game = 1
        let fx1url = Bundle.main.url(forResource: "raw/combine_endgame", withExtension: "mp3")!
        do {
            FXS1player = try AVAudioPlayer(contentsOf: fx1url)
            FXS1player?.numberOfLoops = 0
        } catch {
            //deu ruim
        }
        
        //FX Rank = 2
        let fx2url = Bundle.main.url(forResource: "raw/combine_winner", withExtension: "mp3")!
        do {
            FXS2player = try AVAudioPlayer(contentsOf: fx2url)
            FXS2player?.numberOfLoops = 0
        } catch {
            //deu ruim
        }
        
        //FX NO Rank = 3
        let fx3url = Bundle.main.url(forResource: "raw/combine_game_over", withExtension: "mp3")!
        do {
            FXS3player = try AVAudioPlayer(contentsOf: fx3url)
            FXS3player?.numberOfLoops = 0
        } catch {
            //deu ruim
        }
    }
    
    //finalizar
    @objc func applicationWillTerminate(_ notification: NSNotification) {
        NotificationCenter.default.removeObserver(self)
    }
    
    //volta
    @objc func applicationDidBecomeActive(_ notification: NSNotification) {
        //ponte para despausar o javascript quando voltar para o foco
        isFocus = "play"
        webView.stringByEvaluatingJavaScript(from: "isFocused(\"\(isFocus)\")")
        
        //se internet?
        if Reachability.isConnectedToNetwork() == true {
            onOnLine = "online"
            webView.stringByEvaluatingJavaScript(from: "isOnLine(\"\(onOnLine)\")")
        } else {
            onOnLine = "offline"
            webView.stringByEvaluatingJavaScript(from: "isOnLine(\"\(onOnLine)\")")
        }
    }
    
    //pausa
    @objc func applicationWillResignActive(_ notification: NSNotification) {
        //ponte para pausar o javascript quando fora de foco
        isFocus = "pause"
        webView.stringByEvaluatingJavaScript(from: "isFocused(\"\(isFocus)\")")
    }
    
    
    func webViewDidStartLoad(_ webView: UIWebView) {
        //print("Webview started Loading")
    }
    
    func webViewDidFinishLoad(_ webView: UIWebView) {
        print("Webview did finish load")
        imageView.isHidden = true
        
        //se internet?
        if Reachability.isConnectedToNetwork() == true {
            onOnLine = "online"
            webView.stringByEvaluatingJavaScript(from: "isOnLine(\"\(onOnLine)\")")
        } else {
            onOnLine = "offline"
            webView.stringByEvaluatingJavaScript(from: "isOnLine(\"\(onOnLine)\")")
        }
        isFocus = "play"
        webView.stringByEvaluatingJavaScript(from: "isFocused(\"\(isFocus)\")")
        
    }
    
    
    //LEADERBOARD
    // MARK: - AUTHENTICATE LOCAL PLAYER
    func authenticateLocalPlayer() {
        let localPlayer: GKLocalPlayer = GKLocalPlayer.localPlayer()
        
        localPlayer.authenticateHandler = {(ViewController, error) -> Void in
            if (ViewController) != nil {
                // 1 Show login if player is not logged in
                self.present(ViewController!, animated: true, completion: nil)
                
            } else if localPlayer.isAuthenticated {
                // 2 Player is already euthenticated & logged in, load game center
                self.gcEnabled = true
                
                // Get the default leaderboard ID
                localPlayer.loadDefaultLeaderboardIdentifier(completionHandler: { (leaderboardIdentifer, error) in
                    if error != nil {
                        //print(error!)
                    } else {
                        self.gcDefaultLeaderBoard = leaderboardIdentifer!
                    }
                })
                
            } else {
                // 3 Game center is not enabled on the users device
                self.gcEnabled = false
                //print("Local player could not be authenticated!")
                //print(error)
            }
        }
    }
    
    // Delegate to dismiss the GC controller
    func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true, completion: nil)
        //print("ONDE FICA ISSSOOOOO")
        //quando fecha o rank
    }
    
    // MARK: - OPEN GAME CENTER LEADERBOARD
    func checkLeaderboard() {
        let gcVC = GKGameCenterViewController()
        gcVC.gameCenterDelegate = self
        gcVC.viewState = .leaderboards
        gcVC.leaderboardIdentifier = LEADERBOARD_ID
        present(gcVC, animated: true, completion: nil)
    }
    
    func getDocumentsDirectory() -> NSString {
        let paths = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true)
        let documentsDirectory = paths[0]
        return documentsDirectory as NSString
    }
    
    
    
    //toast errors
    func showToast(message : String) {
        
        let toastLabel = UILabel(frame: CGRect(x: self.view.frame.size.width/2 - 75, y: self.view.frame.size.height-100, width: 150, height: 35))
        toastLabel.backgroundColor = UIColor.black.withAlphaComponent(0.6)
        toastLabel.textColor = UIColor.white
        toastLabel.textAlignment = .center;
        toastLabel.font = UIFont(name: "Montserrat-Light", size: 12.0)
        toastLabel.text = message
        toastLabel.alpha = 1.0
        toastLabel.layer.cornerRadius = 10;
        toastLabel.clipsToBounds  =  true
        self.view.addSubview(toastLabel)
        UIView.animate(withDuration: 4.0, delay: 0.1, options: .curveEaseOut, animations: {
            toastLabel.alpha = 0.0
        }, completion: {(isCompleted) in
            toastLabel.removeFromSuperview()
        })
    }
    
    
    
    //override url
    func webView(_ webView: UIWebView, shouldStartLoadWith request: URLRequest, navigationType: UIWebViewNavigationType) -> Bool {
        
        if request.url!.scheme == "focus" { //para tratar o fxsound in game
            let strf = "\(request.url!.query!)"
            txtFocus = strf as NSString
            //print("TAPPLE-FOCUS", txtFocus)
            
            if txtFocus as String == "play" {
                numFocus = 0
                txtNumFocus = "0"
                if numSound == 0 || numSound == 1 {
                    BGSplayer?.play()
                    BGSplayer?.volume = 0.1
                }
            } else {
                numFocus = 1
                txtNumFocus = "1"
                BGSplayer?.stop()
                BGSplayer?.volume = 0
            }
            
            //print("TAPPLE-TXTNUM_FOCUS", txtNumFocus)
        }
        
        //bg music
        if request.url!.scheme == "bgsound" {
            let str = "\(request.url!.query!)"
            numSound = Int(str)!
            bg_snd = str as NSString
            //print("TAPPLE-BGM", bg_snd)
            
            if numSound == 0 && txtNumFocus == "0" || numSound == 1 && txtNumFocus == "0" {
                BGSplayer?.volume = 0.1
                BGSplayer?.play()
            } else {
                BGSplayer?.stop()
                BGSplayer?.volume = 0
            }
            
            if numSound == 0 && txtNumFocus == "0" || numSound == 2 && txtNumFocus == "0" {
                isEffects = true
            } else {
                isEffects = false
            }
        }
        
        //para tratar o fxsound in game
        if request.url!.scheme == "sndfxtaps" {
            let strk = "\(request.url!.query!)"
            numEffects = Int(strk)!
            fx_snd = strk as NSString
            //print("TAPPLE-SFX", fx_snd)
            
            if isEffects {
                switch (numEffects) {
                case 0://effect
                    /*if let soundURL0 = Bundle.main.url(forResource: "raw/combine_connect", withExtension: "mp3") {
                        var mySound0: SystemSoundID = 0
                        AudioServicesCreateSystemSoundID(soundURL0 as CFURL, &mySound0)
                        AudioServicesPlaySystemSound(mySound0)
                    }*/
                    FXS0player?.play()
                    FXS0player?.volume = 1.0
                    
                    break
                    
                case 1://fim normal
                    /*if let soundURL1 = Bundle.main.url(forResource: "raw/combine_endgame", withExtension: "mp3") {
                        var mySound1: SystemSoundID = 0
                        AudioServicesCreateSystemSoundID(soundURL1 as CFURL, &mySound1)
                        AudioServicesPlaySystemSound(mySound1)
                    }*/
                    FXS1player?.play()
                    FXS1player?.volume = 1.0
                    
                    break
                    
                case 2://fim rank
                    /*if let soundURL2 = Bundle.main.url(forResource: "raw/combine_winner", withExtension: "mp3") {
                        var mySound2: SystemSoundID = 0
                        AudioServicesCreateSystemSoundID(soundURL2 as CFURL, &mySound2)
                        AudioServicesPlaySystemSound(mySound2)
                    }*/
                    FXS2player?.play()
                    FXS2player?.volume = 1.0
                    
                    break
                    
                case 3://fim no rank
                    /*if let soundURL3 = Bundle.main.url(forResource: "raw/combine_game_over", withExtension: "mp3") {
                        var mySound3: SystemSoundID = 0
                        AudioServicesCreateSystemSoundID(soundURL3 as CFURL, &mySound3)
                        AudioServicesPlaySystemSound(mySound3)
                    }*/
                    FXS3player?.play()
                    FXS3player?.volume = 1.0
                    
                    break
                    
                default:
                    break
                }
            }
        }
        
        
        //para trata o data:image
        if request.url!.scheme == "shared" {
            let strq = "\(request.url!.query!)"
            let url = URL(string: strq)!
            
            data = try! Data(contentsOf: url)
            
            let shareText = NSString(string: "My record is: " + (hiscore as String) + " \n try to beat me in #Combine #AlesefsApps \n https://alesefs.github.io/#combine")
            
            let image = UIImage(data: data)
            
            if image != nil && shareText != "" {
                let vc = UIActivityViewController(activityItems: [shareText, image!], applicationActivities: nil)
                
                if let popoverController = vc.popoverPresentationController {
                    popoverController.sourceView = self.view
                    popoverController.sourceRect = CGRect(x: self.view.bounds.midX, y: self.view.bounds.midY, width: 0, height: 0)
                    popoverController.permittedArrowDirections = []
                }
                self.present(vc, animated: true, completion: nil)
            }
        }
        
        //para tratar os links indiretos - funcionando
        if request.url!.scheme == "site" {
            let stra = "\(request.url!.query!)"
            let url = URL(string: stra)!
            
            if #available(iOS 10.0, *) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
                
            } else {
                if UIApplication.shared.openURL(url) {
                    return false
                }
            }
        }
        
        
        //para tratar o score
        if request.url!.scheme == "score" {
            let strs = "\(request.url!.query!)"
            hiscore = strs as NSString
            numHiScore = Int(strs)!
            //print("TAPPLE-HISCORE", hiscore)
            
            if Reachability.isConnectedToNetwork() == true {
                // Submit score to GC leaderboard
                let bestScoreInt = GKScore(leaderboardIdentifier: LEADERBOARD_ID)
                bestScoreInt.value = Int64(numHiScore)
                GKScore.report([bestScoreInt]) { (error) in
                    if error != nil {
                        //print(error!.localizedDescription)
                    } else {
                        //print("Best Score submitted to your Leaderboard!")
                        //self.checkLeaderboard()
                    }
                }
            }
        }
        
        
        //envio e abrir o game center
        if request.url!.scheme == "open" {
            if Reachability.isConnectedToNetwork() == true {
                self.checkLeaderboard()
            }
        }
        
        //para tratar o reward
        if request.url!.scheme == "reward" {
            let strv = "\(request.url!.query!)"
            txtReward = strv as NSString
            numReward = Int(strv)!
            //print("TAPPLE-REWARD", txtReward)
            
            if numReward == 0 {
                rewardBasedVideo?.load(GADRequest(), withAdUnitID: ADMOB_REWARD_UNIT_ID)
                
            } else if numReward == 1 {
                //video reward
                if rewardBasedVideo?.isReady == true {
                    rewardBasedVideo?.present(fromRootViewController: self)
                
                } else {
                    var countError = 0
                    countError += 1
                    
                    if countError < 5 {
                        self.showToast(message: "ERROR, try again")
                        
                    } else {
                        numReward = -1
                        webView.stringByEvaluatingJavaScript(from: "rewarded(\"\(numReward)\")")
                        countError = 0
                    }
                }
            }
            
            print("TAPPLE-REWARD: \(numReward)")
        }
        
        
        // Display the intertitial ad
        if request.url!.scheme == "inter" {
            let strm = "\(request.url!.query!)"
            interTxt = strm as NSString
            numInter = Int(strm)!
            //print("TAPPLE-INTER", interTxt)
            //print("rewarded-INTER", interTxt)
            
            if numInter == 0 {
                interstitial = createAndLoadInterstitial()
            }
        }
        
        //tratar os links banner
        if navigationType == UIWebViewNavigationType.linkClicked {
            //UIApplication.shared.openURL(request.url!)
            let url = URL(string: "\(request.url!)")!
            if #available(iOS 10.0, *) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            } else {
                if UIApplication.shared.openURL(url) {
                    return false
                }
            }
            return false
        }
        
        return true
    }
    
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    //rotação
    override var shouldAutorotate : Bool {
        return true
    }
    
    //so em portrait
    override var supportedInterfaceOrientations : UIInterfaceOrientationMask {
        return [UIInterfaceOrientationMask.portrait]
    }
    
    //sem barra de status
    override var prefersStatusBarHidden : Bool {
        return true
    }
    
    
    /// MARK: -  ADMOB BANNER
    func initAdMobBanner() {
        
        if UIDevice.current.userInterfaceIdiom == .phone {
            // iPhone
            addBannerViewToView(adMobBannerView)
            //adMobBannerView.frame = CGRect(x: 0, y: view.frame.size.height, width: view.frame.size.width, height: 50)
            //if ((UIScreen.main.bounds.height * UIScreen.main.scale) == 2436) {
            //    adMobBannerView.adSize =  GADAdSizeFromCGSize(CGSize(width: view.frame.size.width, height: 50))
            //} else {
            adMobBannerView.adSize =  GADAdSizeFromCGSize(CGSize(width: view.frame.size.width, height: 50))
            //}
        } else {
            // iPad
            adMobBannerView.adSize =  GADAdSizeFromCGSize(CGSize(width: view.frame.size.width, height: 90))
            adMobBannerView.frame = CGRect(x: 0, y: view.frame.size.height, width: view.frame.size.width, height: 90)
            view.addSubview(adMobBannerView)
        }
        
        adMobBannerView.adUnitID = ADMOB_BANNER_UNIT_ID
        adMobBannerView.rootViewController = self
        adMobBannerView.delegate = self
        //view.addSubview(adMobBannerView)
        //let request = GADRequest()
        adMobBannerView.load(GADRequest())
    }
    
    
    func addBannerViewToView(_ adMobBannerView: UIView) {
        adMobBannerView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(adMobBannerView)
        
        if #available(iOS 11.0, *) {
            positionBannerAtBottomOfSafeArea(adMobBannerView)
        } else {
            positionBannerAtBottomOfView(adMobBannerView)
        }
    }
    
    
    @available (iOS 11, *)
    func positionBannerAtBottomOfSafeArea(_ adMobBannerView: UIView) {
        let guide: UILayoutGuide = view.safeAreaLayoutGuide
        
        NSLayoutConstraint.activate([adMobBannerView.centerXAnchor.constraint(equalTo: guide.centerXAnchor), adMobBannerView.bottomAnchor.constraint(equalTo: guide.bottomAnchor)])
        
        //view.addConstraint(NSLayoutConstraint(item: adMobBannerView, attribute: .centerX, relatedBy: .equal, toItem: view, attribute: .centerX, multiplier: 1, constant: 0))
        //view.addConstraint(NSLayoutConstraint(item: adMobBannerView, attribute: .bottom, relatedBy: .equal, toItem: self.bottomLayoutGuide, attribute: .top, multiplier: 1, constant: 0))
    }
    
    func positionBannerAtBottomOfView(_ adMobBannerView: UIView) {
        
        view.addConstraint(NSLayoutConstraint(item: adMobBannerView, attribute: .centerX, relatedBy: .equal, toItem: view, attribute: .centerX, multiplier: 1, constant: 0))
        
        view.addConstraint(NSLayoutConstraint(item: adMobBannerView, attribute: .bottom, relatedBy: .equal, toItem: self.bottomLayoutGuide, attribute: .top, multiplier: 1, constant: 0))
    }
    
    
    // Hide the banner
    func hideBanner(_ banner: UIView) {
        UIView.beginAnimations("hideBanner", context: nil)
        banner.frame = CGRect(x: view.frame.size.width/2 - banner.frame.size.width/2, y: view.frame.size.height - banner.frame.size.height, width: banner.frame.size.width, height: banner.frame.size.height)
        UIView.commitAnimations()
        banner.isHidden = true
    }
    
    // Show the banner
    func showBanner(_ banner: UIView) {
        UIView.beginAnimations("showBanner", context: nil)
        banner.frame = CGRect(x: view.frame.size.width/2 - banner.frame.size.width/2, y: view.frame.size.height - banner.frame.size.height, width: banner.frame.size.width, height: banner.frame.size.height)
        UIView.commitAnimations()
        banner.isHidden = false
    }
    
    // AdMob banner available
    func adViewDidReceiveAd(_ view: GADBannerView) {
        showBanner(adMobBannerView)
    }
    
    // NO AdMob banner available
    func adView(_ view: GADBannerView, didFailToReceiveAdWithError error: GADRequestError) {
        hideBanner(adMobBannerView)
    }
    
    //AdMob Interstitial
    private func createAndLoadInterstitial() -> GADInterstitial? {
        interstitial = GADInterstitial(adUnitID: ADMOB_INTERSTITIAL_UNIT_ID)
        guard let interstitial = interstitial else {
            return nil
        }
        let request = GADRequest()
        //request.testDevices = [ kGADSimulatorID ]
        interstitial.load(request)
        interstitial.delegate = self
        return interstitial
    }
    
    // MARK: - GADInterstitialDelegate methods
    func interstitialDidReceiveAd(_ ad: GADInterstitial) {
        //print("Interstitial loaded successfully")
        ad.present(fromRootViewController: self)
    }
    
    func interstitialDidFail(toPresentScreen ad: GADInterstitial) {
        //print("Fail to receive interstitial")
    }
    
    
    //video reward
    // MARK: GADRewardBasedVideoAdDelegate implementation
    func rewardBasedVideoAd(_ rewardBasedVideoAd: GADRewardBasedVideoAd,
                            didRewardUserWith reward: GADAdReward) {
        //print("TAPPLE- Reward received with currency: \(reward.type), amount \(reward.amount).")
        earnCoins(NSInteger(truncating: reward.amount))//recompença
    }
    
    func rewardBasedVideoAd(_ rewardBasedVideoAd: GADRewardBasedVideoAd,
                            didFailToLoadWithError error: Error) {
        //print("TAPPLE- Reward based video ad failed to load: \(error.localizedDescription)")
        //print("rewarded: reward Based Video fail")
    }
    
    func rewardBasedVideoAdDidReceive(_ rewardBasedVideoAd: GADRewardBasedVideoAd) {
        //print("TAPPLE- Reward based video ad is received.")
        //print("rewarded: video received")
    }
    
    func rewardBasedVideoAdDidOpen(_ rewardBasedVideoAd: GADRewardBasedVideoAd) {
        //print("TAPPLE- Opened reward based video ad.")
        //print("rewarded: Opened reward")
    }
    
    func rewardBasedVideoAdDidStartPlaying(_ rewardBasedVideoAd: GADRewardBasedVideoAd) {
        //print("TAPPLE- Reward based video ad started playing.")
        //print("rewarded: started playing")
    }
    
    func rewardBasedVideoAdDidClose(_ rewardBasedVideoAd: GADRewardBasedVideoAd) {
        //print("TAPPLE- Reward based video ad is closed.")
        //numReward = -1
        
        if numReward == 2 {
            isRewarded = true
        } else {
            isRewarded = false
        }
        
        if isRewarded {
            numReward = 2
        } else {
            numReward = -1
        }
        
        webView.stringByEvaluatingJavaScript(from: "rewarded(\"\(numReward)\")")
        //print("TAPPLE-REWARD: \(numReward)")
    }
    
    func rewardBasedVideoAdWillLeaveApplication(_ rewardBasedVideoAd: GADRewardBasedVideoAd) {
        //print("TAPPLE- Reward based video ad will leave application.")
        //print("rewarded: leave application")
    }
    
    fileprivate func earnCoins(_ coins: NSInteger) {
        numReward = 2
        //webView.stringByEvaluatingJavaScript(from: "rewarded(\"\(numReward)\")")
        //print("rewarded: \(numReward)")
    }


}

