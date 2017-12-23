//
//  Config.swift
//  isermon
//
//  Created by jim on 13/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import Foundation

//let SERVER_IP = "localhost"       //local
let SERVER_IP = "52.221.212.21"     //AWS
let PORT = "4001"

class Me {
    static let sharedInstance = Me()
    var username: String?
    var email: String?
    
    var liked_sermon_ids: Set<String>?
    var bookmarked_sermon_ids: Set<String>?
    
}

