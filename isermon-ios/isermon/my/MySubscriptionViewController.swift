//
//  MySubscriptionViewController.swift
//  isermon
//
//  Created by jim on 25/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import UIKit
import Alamofire

class MySubscriptionViewController: UIViewController, UITableViewDataSource, UITableViewDelegate, UITextFieldDelegate {

    @IBOutlet weak var subscribeUsername: UITextField!
    
    var subscribedUsers = [String]()
    
    @IBOutlet var tableView: UITableView!
    
    let cellReuseIdentifier = "cell"
    let cellIdentifier = "SubscribedUserTableViewCell"

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        let username = Me.sharedInstance.username
        loadSubscribedUsers(username: username, completion: {(usernames: [String]) -> () in
            self.subscribedUsers = usernames
            DispatchQueue.main.async{
                self.tableView.reloadData()
            }
        })
        
        // Register the table view cell class and its reuse id
        self.tableView.register(UITableViewCell.self, forCellReuseIdentifier: cellReuseIdentifier)
        
        // This view controller itself will provide the delegate methods and row data for the table view.
        tableView.delegate = self
        tableView.dataSource = self
        
        subscribeUsername.delegate = self
    }

    
    // number of rows in table view
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.subscribedUsers.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        guard let cell = tableView.dequeueReusableCell(withIdentifier: cellIdentifier, for: indexPath) as? SubscribedUserTableViewCell else {
            fatalError("the dequeued cell is not an instance of required")
        }
        
        let username = subscribedUsers[indexPath.row]
        cell.subscribedUsername.text = username
        return cell
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        subscribeUsername.resignFirstResponder()
        return true
    }

    
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
        super.prepare(for: segue, sender: sender)
        
        guard let sermonTableViewController = segue.destination as? SermonTableViewController else {
            fatalError("unexpected destination: \(segue.destination)")
        }
        
        guard let selectedCell = sender as? SubscribedUserTableViewCell else {
            fatalError("unexpected sender: \(String(describing: sender))")
        }
        
        guard let indexPath = tableView.indexPath(for: selectedCell) else {
            fatalError("The selected cell is not being displayed by the table")
        }
        
        let subscribedUser = subscribedUsers[indexPath.row]
        sermonTableViewController.uploadedByUsername = subscribedUser
    }
    

    @IBAction func subscribe(_ sender: Any) {
        let username = Me.sharedInstance.username
        let subscribe_username = subscribeUsername.text
        if username == nil || username == "" || username == "guest" {
            let alert = UIAlertController(title: "提示", message: "請先登錄。", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: NSLocalizedString("好", comment: "Default action"), style: .`default`, handler: { _ in
                NSLog("The \"OK\" alert occured.")
            }))
            self.present(alert, animated: true, completion: nil)
        } else if subscribe_username == nil || subscribe_username == "" {
            let alert = UIAlertController(title: "提示", message: "請檢查訂閱用戶名。", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: NSLocalizedString("好", comment: "Default action"), style: .`default`, handler: { _ in
                NSLog("The \"OK\" alert occured.")
            }))
            self.present(alert, animated: true, completion: nil)
        } else {
            isermon.subscribeUsername(username: username!, subscribe_username: subscribe_username!,completion: {(result: String) -> () in
                print("result: \(result)")
                
                if result.range(of:"success") != nil {
                    let alert = UIAlertController(title: "提示", message: "訂閱成功。", preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: NSLocalizedString("好", comment: "Default action"), style: .`default`, handler: { _ in
                        NSLog("The \"OK\" alert occured.")
                    }))
                    self.present(alert, animated: true, completion: nil)
                } else {
                    let alert = UIAlertController(title: "提示", message: "訂閱不成功，請檢查網絡狀況。", preferredStyle: .alert)
                    alert.addAction(UIAlertAction(title: NSLocalizedString("好", comment: "Default action"), style: .`default`, handler: { _ in
                        NSLog("The \"OK\" alert occured.")
                    }))
                    self.present(alert, animated: true, completion: nil)
                }
            })
        }
    }
}

func subscribeUsername(username: String, subscribe_username: String, completion: @escaping (_ result: String) -> ()){
    var urlStr: String?
    urlStr = "http://" + SERVER_IP + ":" + PORT + "/subscribeUser"
    let url = URL(string: urlStr!)
    print("url: \(url!)")
    
    let parameters: Parameters = [
        "username": username,
        "subscribe_username": subscribe_username
    ]
    
    Alamofire.request(url!, method: .post, parameters: parameters, encoding: URLEncoding.default).responseString { response in
        if let result = response.result.value {
            print("Response: \(result)")
            completion(result)
        }
    }
}


func loadSubscribedUsers(username: String? = nil, completion: @escaping (_ subscribedUsers: [String]) -> ()){
    var urlStr = "http://" + SERVER_IP + ":" + PORT + "/subscribes?username="
    urlStr = urlStr + username!
    let url = URL(string: urlStr)
    print("Query:>> url: ")
    print(url!)
    
    Alamofire.request(url!).responseJSON { response in
        if let json = response.result.value as? [String: Any] {
            let username = json["username"]
            if username != nil {
                print("subcribed by:")
                print(username!)
                let usernames = json["subscribe_usernames"] as! [String]
                completion(usernames)
            } else {
                let usernames = [String]()
                completion(usernames)
            }
        }
        
    }
}




