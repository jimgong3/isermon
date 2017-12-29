//
//  SermonTableViewController.swift
//  isermon
//
//  Created by jim on 12/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import UIKit
import Alamofire
import AVFoundation

class SermonTableViewController: UIViewController, UITableViewDataSource, 
									UITabBarControllerDelegate,
									UITableViewDelegate {
    
    var username: String?
    var bookmarkedByUsername: String?   //user tap My Bookmarked Sermons
    var uploadedByUsername: String?     //user tap My Uploaded Sermons
    var sermons = [Sermon]()
    var sermonPlaying: Sermon?
    
    @IBOutlet var tableView: UITableView!

    let cellReuseIdentifier = "cell"
    let cellIdentifier = "SermonTableViewCell"

    var player = AVPlayer()
    var lastPlay: UIButton?
    
    @IBOutlet weak var nowPlaying: UILabel!
    @IBOutlet weak var playCurrentButton: UIButton!
    
    var updater : CADisplayLink?
    @IBOutlet weak var playbackSlider: UISlider!
    @IBOutlet weak var currentTime: UILabel!
    @IBOutlet weak var totalTime: UILabel!
	
    var lastPlayProgress = [String: Int64]()
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
		// self.tabBarController?.delegate = self
		
        username = UserDefaults.standard.string(forKey: "username")
        if username != nil && username != "" {
            print("returning user: \(String(describing: username))")
            Me.sharedInstance.username = username
            isermon.getLikelist(username: username!, completion: {(sermon_ids: Set<String>) -> () in
                Me.sharedInstance.liked_sermon_ids = sermon_ids
            })
            isermon.getBookmark(username: username!, completion: {(sermon_ids: Set<String>) -> () in
                Me.sharedInstance.bookmarked_sermon_ids = sermon_ids
            })
        }
		
        if UserDefaults.standard.dictionary(forKey: "lastPlayProgress") != nil {
            lastPlayProgress = (UserDefaults.standard.dictionary(forKey: "lastPlayProgress") as? [String : Int64])!
        }

        // Register the table view cell class and its reuse id
        self.tableView.register(UITableViewCell.self, forCellReuseIdentifier: cellReuseIdentifier)
        
        // This view controller itself will provide the delegate methods and row data for the table view.
        tableView.delegate = self
        tableView.dataSource = self
        
        if bookmarkedByUsername != nil {
            self.title = "我的收藏"
        } else if uploadedByUsername != nil {
            self.title = "我上傳的"
        }

        if selectedTabIndex == 0 || selectedTabIndex == 3 {  // Latest
            loadSermons(bookmarkedByUsername: bookmarkedByUsername, uploadedByUsername: uploadedByUsername, completion: {(sermons: [Sermon]) -> () in
                self.sermons = sermons
                DispatchQueue.main.async{
                    self.tableView.reloadData()
                }
            })
        } else if selectedTabIndex == 1 { // Hot
            loadHotSermons2(completion: {(sermons: [Sermon]) -> () in
                self.sermons = sermons
                DispatchQueue.main.async{
                    self.tableView.reloadData()
                }
            })
        } else if selectedTabIndex == 2 {  // Subscribed
            loadSubscribedSermons2(username: username, completion: {(sermons: [Sermon]) -> () in
                self.sermons = sermons
                DispatchQueue.main.async{
                    self.tableView.reloadData()
                }
            })
        }
       
        do {
            try AVAudioSession.sharedInstance().setCategory(AVAudioSessionCategoryPlayback, with: .mixWithOthers)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print(error)
        }
    }
    
    // number of rows in table view
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.sermons.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        guard let cell = tableView.dequeueReusableCell(withIdentifier: cellIdentifier, for: indexPath) as? SermonTableViewCell else {
            fatalError("the dequeued cell is not an instance of required")
        }
        
        let sermon = sermons[indexPath.row]
        
        cell.title.text = sermon.title
        cell.desc.text = sermon.description

        var remarks = " | "
        if sermon.username != nil {
            remarks = sermon.username! + remarks
        }
        if sermon.date != nil {
            remarks = remarks + sermon.date!
        }
        cell.remarks.text = remarks
        
        cell.listen.setTitle("  " + (sermon.num_listen?.description)!, for: .normal)
        
        cell.like.tag = indexPath.row
        if Me.sharedInstance.liked_sermon_ids != nil && Me.sharedInstance.liked_sermon_ids!.contains(sermon.id!) {
            cell.like.setImage(UIImage(named: "liked"), for: .normal)
        } else {
            cell.like.setImage(UIImage(named: "like"), for: .normal)
        }
        cell.like.setTitle("  " + (sermon.num_like?.description)!, for: .normal)
        
        let bookmarked_sermon_ids = Me.sharedInstance.bookmarked_sermon_ids
        cell.bookmark.tag = indexPath.row
        if bookmarked_sermon_ids != nil && bookmarked_sermon_ids!.contains(sermon.id!) {
            cell.bookmark.setImage(UIImage(named: "bookmarked"), for: .normal)
        } else {
            cell.bookmark.setImage(UIImage(named: "bookmark"), for: .normal)
        }
        cell.bookmark.setTitle("  " + (sermon.num_bookmark?.description)!, for: .normal)

        cell.play.tag = indexPath.row
        
        return cell
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */
	
    @IBAction func play(_ sender: Any) {
        print("tap play/pause...")
        
        let button = sender as! UIButton
        if button.titleLabel?.text == "PLAY" {
			print("tap play...")
			button.setTitle("PAUSE", for: .normal)
            playCurrentButton.setImage(UIImage(named: "pause"), for: .normal)

            let index = (sender as! UIButton).tag
            sermonPlaying = sermons[index]
            let playerItem = playerItemInit()
			
            updater = CADisplayLink(target: self, selector: #selector(SermonTableViewController.trackAudio))
            updater?.preferredFramesPerSecond = 1
            updater?.add(to: RunLoop.current, forMode: RunLoopMode.commonModes)

            if player.currentItem == nil {
                print("play a new audio...")				
//                button.setTitle("PAUSE", for: .normal)
                lastPlay = button
	
//                player = AVPlayer(playerItem:playerItem)
//                player.rate = 1.0;
//                player.play()
//                playbackSliderInit()
//                setTotalTime()
//                addSermonListenCount(sermon_id: (sermonPlaying?.id!)!, completion: {(result: String) -> () in
//                    print("result: \(result)")
//                })
				playItem(playerItem: playerItem)
            } else {
                let url2 = ((player.currentItem?.asset) as? AVURLAsset)?.url
                if (playerItem.asset as? AVURLAsset)?.url == url2 {
                    print("continue to play an audio...")
                    player.play()
//                    button.setTitle("PAUSE", for: .normal)
                } else {
                    print("switch to play another audio")
//                    button.setTitle("PAUSE", for: .normal)
                    lastPlay?.setTitle("PLAY", for: .normal)
                    lastPlay = button

//                    player = AVPlayer(playerItem:playerItem)
//                    player.rate = 1.0;
//                    player.play()
//                    playbackSliderInit()
//                    setTotalTime()
//                    addSermonListenCount(sermon_id: (sermonPlaying?.id!)!, completion: {(result: String) -> () in
//                        print("result: \(result)")
//                    })
					playItem(playerItem: playerItem)
                }
            }
        } else {
            print("tap to pause...")
            player.pause()
            button.setTitle("PLAY", for: .normal)
            playCurrentButton.setImage(UIImage(named: "play"), for: .normal)
        }
    }
	
	func playItem(playerItem: AVPlayerItem){
		player = AVPlayer(playerItem:playerItem)
		player.rate = 1.0;
		
        let lastPlayTime = lastPlayProgress[(sermonPlaying?.id)!]
        if lastPlayTime != nil {
            let targetTime:CMTime = CMTimeMake(lastPlayTime!, 1)
            player.seek(to: targetTime)
        }
				
		player.play()
		
		playbackSliderInit()
//        setTotalTime()
        addSermonListenCount(sermon_id: (sermonPlaying?.id!)!, completion: {(result: String) -> () in
			print("result: \(result)")
        })
	}
    
    func playerItemInit() -> AVPlayerItem {
        let urlString = sermonPlaying?.urlLocal
        print("sermon url: " + urlString!)
        let url = URL(string: urlString!)
        let asset = AVAsset(url: url!)
        let playerItem = AVPlayerItem(asset: asset)
        return playerItem
    }
    
    func playbackSliderInit(){
        let duration: CMTime = player.currentItem!.asset.duration
        let seconds: Float64 = CMTimeGetSeconds(duration)
        playbackSlider.maximumValue = Float(seconds)
        playbackSlider.isContinuous = true
        playbackSlider.tintColor = UIColor.blue
        playbackSlider.addTarget(self, action: #selector(SermonTableViewController.playbackSliderValueChanged(_:)), for: .valueChanged)
        
        nowPlaying.text = sermonPlaying?.title
		
		let totalTimeSeconds: Float64 = CMTimeGetSeconds(player.currentItem!.asset.duration)
        self.totalTime.text = secondsToText(seconds: Int(totalTimeSeconds))
    }
	
    func playbackSliderValueChanged(_ playbackSlider:UISlider) {
        let seconds : Int64 = Int64(playbackSlider.value)
        let targetTime:CMTime = CMTimeMake(seconds, 1)
        player.seek(to: targetTime)
        //player.play()
    }
    
    func secondsToHoursMinutesSeconds (seconds : Int) -> (Int, Int, Int) {
        return (seconds / 3600, (seconds % 3600) / 60, (seconds % 3600) % 60)
    }
    
    func secondsToText (seconds: Int) -> String {
        let (h, m, s) = secondsToHoursMinutesSeconds(seconds: Int(seconds))
        var text = String()
        if h==0{
            if s<10 {
                text = "\(m):0\(s)"     //e.g. 5:05, 10:05
            } else {
                text = "\(m):\(s)"      //e.g. 5:15, 10:15
            }
        } else {
            if m<10 {
                if s<10 {
                    text = "\(h):0\(m):0\(s)"   //e.g. 1:05:05
                } else {
                    text = "\(h):0\(m):\(s)"    //e.g. 1:05:15
                }
            } else {
                if s<10 {
                    text = "\(h):\(m):0\(s)"    //e.g. 1:10:05
                } else {
                    text = "\(h):\(m):\(s)"     //e.g. 1:15:15
                }
            }
        }
        return text
    }
    
    func trackAudio() {
        let currentTime = player.currentTime
        let currentSeconds: Float64 = CMTimeGetSeconds(currentTime())
        playbackSlider.value = Float(currentSeconds)
        
        let text = secondsToText(seconds: Int(currentSeconds))
//        print("current time: \(text)")
        self.currentTime.text = text

        lastPlayProgress[(sermonPlaying?.id)!] = Int64(currentSeconds)
        UserDefaults.standard.set(lastPlayProgress, forKey: "lastPlayProgress")
    }
    
    @IBAction func tapPlayCurrent(_ sender: Any) {
        let button = sender as! UIButton
        if player.rate == 1.0 { //was playing - to stop
            player.pause()
            lastPlay?.setTitle("PLAY", for: .normal)
            button.setImage(UIImage(named: "play"), for: .normal)
        } else {    //was stop - try to start
            if player.currentItem != nil {
                player.rate = 1.0
                player.play()
                lastPlay?.setTitle("PAUSE", for: .normal)
                button.setImage(UIImage(named: "pause"), for: .normal)
            }
        }
    }
    
    @IBAction func like(_ sender: Any) {
        let button = sender as! UIButton
        if button.currentImage == UIImage(named: "liked") {
            print("tap to un-like")
//            if let image = UIImage(named: "like") {
//                button.setImage(image, for: UIControlState.normal)
//            }
            button.setImage(UIImage(named: "like"), for: .normal)
            if let username = Me.sharedInstance.username {
                let sermon_id = sermons[button.tag].id
                unlikeSermon(username: username, sermon_id: sermon_id!, completion: {(result: String) -> () in
                    print("result: \(result)")
                    button.setTitle("  ", for: .normal)
                })
            }
        } else {
            print("tap to like...")
//            if let image = UIImage(named: "liked") {
//                button.setImage(image, for: UIControlState.normal)
//            }
            button.setImage(UIImage(named: "liked"), for: .normal)
            if let username = Me.sharedInstance.username {
                let sermon_id = sermons[button.tag].id
                likeSermon(username: username, sermon_id: sermon_id!, completion: {(result: String) -> () in
                    print("result: \(result)")
                    button.setTitle("  ", for: .normal)
                })
            }
        }
    }
    
    @IBAction func bookmark(_ sender: Any) {
        let button = sender as! UIButton
        if button.currentImage == UIImage(named: "bookmarked") {
            print("tap to un-bookmark")
//            if let image = UIImage(named: "bookmark") {
//                button.setImage(image, for: UIControlState.normal)
//            }
            button.setImage(UIImage(named: "bookmark"), for: .normal)
            if let username = Me.sharedInstance.username {
                let sermon_id = sermons[button.tag].id
                unbookmarkSermon(username: username, sermon_id: sermon_id!, completion: {(result: String) -> () in
                    print("result: \(result)")
                    button.setTitle("  ", for: .normal)
                })
            }
        } else {
            print("tap to bookmark...")
//            if let image = UIImage(named: "bookmarked") {
//                button.setImage(image, for: UIControlState.normal)
//            }
            button.setImage(UIImage(named: "bookmarked"), for: .normal)
            if let username = Me.sharedInstance.username {
                let sermon_id = sermons[button.tag].id
                bookmarkSermon(username: username, sermon_id: sermon_id!, completion: {(result: String) -> () in
                    print("result: \(result)")
                    button.setTitle("  ", for: .normal)
                })
            }
        }
    }
}

func loadSermons(bookmarkedByUsername: String? = nil,
                 uploadedByUsername: String? = nil,
                 completion: @escaping (_ sermons: [Sermon]) -> ()){
    
    var urlStr = "http://" + SERVER_IP + ":" + PORT + "/sermons"
    if bookmarkedByUsername != nil {
        print("user tapped: my bookmarked sermons")
        urlStr += "?bookmarkedBy=" + bookmarkedByUsername!
    } else if uploadedByUsername != nil {
        print("user tapped: my uploaded sermons")
        urlStr += "?uploadedBy=" + uploadedByUsername!
    }
    let url = URL(string: urlStr)
    print("Query:>> url: ")
    print(url!)
    
    Alamofire.request(url!).responseJSON { response in
        if let json = response.result.value {
            var sermons = [Sermon]()
            if let array = json as? [Any] {
                if array.count>0 {
                    for i in 0...array.count-1 {
                        let sermonJson = array[i] as? [String: Any]
                        let s = Sermon(json: sermonJson!)
                        sermons.append(s!)
                    }
                }
                else{
                    print("oops, no sermon is found")
                }
            }
            print ("\(sermons.count)" + " sermons loaded, callback completion")
            completion(sermons)
        }
    }
}

func loadHotSermons2(completion: @escaping (_ sermons: [Sermon]) -> ()){
    
    let urlStr = "http://" + SERVER_IP + ":" + PORT + "/sermons?sortBy=num_listen"
    let url = URL(string: urlStr)
    print("Query:>> url: ")
    print(url!)
    
    Alamofire.request(url!).responseJSON { response in
        if let json = response.result.value {
            var sermons = [Sermon]()
            if let array = json as? [Any] {
                if array.count>0 {
                    for i in 0...array.count-1 {
                        let sermonJson = array[i] as? [String: Any]
                        let s = Sermon(json: sermonJson!)
                        sermons.append(s!)
                    }
                }
                else{
                    print("Query>> oops, no sermons is found")
                }
            }
            print ("Query>> \(sermons.count)" + " sermons loaded, callback completion")
            completion(sermons)
        }
    }
}

func loadSubscribedSermons2(username: String? = nil, completion: @escaping (_ sermons: [Sermon]) -> ()){
    
    if username == nil || username == "" {
        let sermons = [Sermon]()
        completion(sermons)
        return
    }
    
    var urlStr = "http://" + SERVER_IP + ":" + PORT + "/sermons?subscribedByUsername="
    urlStr = urlStr + username!
    let url = URL(string: urlStr)
    print("Query:>> url: ")
    print(url!)
    
    Alamofire.request(url!).responseJSON { response in
        if let json = response.result.value {
            var sermons = [Sermon]()
            if let array = json as? [Any] {
                if array.count>0 {
                    for i in 0...array.count-1 {
                        let sermonJson = array[i] as? [String: Any]
                        let s = Sermon(json: sermonJson!)
                        sermons.append(s!)
                    }
                }
                else{
                    print("Query>> oops, no sermon is found")
                }
            }
            print ("Query>> \(sermons.count)" + " sermons loaded, callback completion")
            completion(sermons)
        }
    }
}

func likeSermon(username: String, sermon_id: String, completion: @escaping (_ result: String) -> ()){
    var urlStr: String?
    urlStr = "http://" + SERVER_IP + ":" + PORT + "/likeSermon"
    let url = URL(string: urlStr!)
    print("url: \(url!)")
    
    let parameters: Parameters = [
        "username": username,
        "sermon_id": sermon_id
    ]
    
    Alamofire.request(url!, method: .post, parameters: parameters, encoding: URLEncoding.default).responseString { response in
        if let result = response.result.value {
            print("Response: \(result)")
            completion(result)
        }
    }
}

func unlikeSermon(username: String, sermon_id: String, completion: @escaping (_ result: String) -> ()){
    var urlStr: String?
    urlStr = "http://" + SERVER_IP + ":" + PORT + "/unlikeSermon"
    let url = URL(string: urlStr!)
    print("url: \(url!)")
    
    let parameters: Parameters = [
        "username": username,
        "sermon_id": sermon_id
    ]
    
    Alamofire.request(url!, method: .post, parameters: parameters, encoding: URLEncoding.default).responseString { response in
        if let result = response.result.value {
            print("Response: \(result)")
            completion(result)
        }
    }
}


func bookmarkSermon(username: String, sermon_id: String, completion: @escaping (_ result: String) -> ()){
    var urlStr: String?
    urlStr = "http://" + SERVER_IP + ":" + PORT + "/bookmarkSermon"
    let url = URL(string: urlStr!)
    print("url: \(url!)")
    
    let parameters: Parameters = [
        "username": username,
        "sermon_id": sermon_id
    ]
    
    Alamofire.request(url!, method: .post, parameters: parameters, encoding: URLEncoding.default).responseString { response in
        if let result = response.result.value {
            print("Response: \(result)")
            completion(result)
        }
    }
}

func unbookmarkSermon(username: String, sermon_id: String, completion: @escaping (_ result: String) -> ()){
    var urlStr: String?
    urlStr = "http://" + SERVER_IP + ":" + PORT + "/unbookmarkSermon"
    let url = URL(string: urlStr!)
    print("url: \(url!)")
    
    let parameters: Parameters = [
        "username": username,
        "sermon_id": sermon_id
    ]
    
    Alamofire.request(url!, method: .post, parameters: parameters, encoding: URLEncoding.default).responseString { response in
        if let result = response.result.value {
            print("Response: \(result)")
            completion(result)
        }
    }
}

func addSermonListenCount(sermon_id: String, completion: @escaping (_ result: String) -> ()){
    var urlStr: String?
    urlStr = "http://" + SERVER_IP + ":" + PORT + "/addSermonListenCount"
    let url = URL(string: urlStr!)
    print("url: \(url!)")
    
    let parameters: Parameters = [
        "sermon_id": sermon_id
    ]
    
    Alamofire.request(url!, method: .post, parameters: parameters, encoding: URLEncoding.default).responseString { response in
        if let result = response.result.value {
            print("Response: \(result)")
            completion(result)
        }
    }
}

