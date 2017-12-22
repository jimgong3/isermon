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

class SermonTableViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {
    
    var sermons = [Sermon]()
    
    @IBOutlet var tableView: UITableView!

    let cellReuseIdentifier = "cell"
    let cellIdentifier = "SermonTableViewCell"

    var player = AVPlayer()

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        loadSermons(completion: {(sermons: [Sermon]) -> () in
            self.sermons = sermons
            DispatchQueue.main.async{
                self.tableView.reloadData()
            }
        })
        
        // Register the table view cell class and its reuse id
        self.tableView.register(UITableViewCell.self, forCellReuseIdentifier: cellReuseIdentifier)
        
        // This view controller itself will provide the delegate methods and row data for the table view.
        tableView.delegate = self
        tableView.dataSource = self
        
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
        cell.like.tag = 0
        cell.like.setTitle("  " + (sermon.num_like?.description)!, for: .normal)
        cell.bookmark.tag = 0
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
        print("playing")
        
        let button = sender as! UIButton
        if button.titleLabel?.text == "PLAY" {
            let index = (sender as! UIButton).tag
            let sermon = sermons[index]
            let urlString = sermon.urlLocal
            print("sermon url: " + urlString!)
            let url = URL(string: urlString!)
            let asset = AVAsset(url: url!)
            let playerItem = AVPlayerItem(asset: asset)
            
            player = AVPlayer(playerItem:playerItem)
            player.rate = 1.0;
            player.play()
            button.setTitle("STOP", for: .normal)
        } else {
            print("stopping")
            player.pause()
            button.setTitle("PLAY", for: .normal)
        }
    }
    
    @IBAction func like(_ sender: Any) {
        print("tap like...")
        let button = sender as! UIButton
        if button.tag == 0 {
            button.tag = 1
            if let image = UIImage(named: "liked") {
                button.setImage(image, for: UIControlState.normal)
            }
        } else {
            button.tag = 0
            if let image = UIImage(named: "like") {
                button.setImage(image, for: UIControlState.normal)
            }
        }
    }
    
    @IBAction func bookmark(_ sender: Any) {
        print("tap bookmark...")
        let button = sender as! UIButton
        if button.tag == 0 {
            button.tag = 1
            if let image = UIImage(named: "bookmarked") {
                button.setImage(image, for: UIControlState.normal)
            }
        } else {
            button.tag = 0
            if let image = UIImage(named: "bookmark") {
                button.setImage(image, for: UIControlState.normal)
            }
        }
    }
}

func loadSermons(completion: @escaping (_ books: [Sermon]) -> ()){
    
    let url = URL(string: "http://" + SERVER_IP + ":" + PORT + "/sermons")
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
                    print("Query>> oops, no book is found")
                }
            }
            print ("Query>> \(sermons.count)" + " sermons loaded, callback completion")
            completion(sermons)
        }
    }
}


