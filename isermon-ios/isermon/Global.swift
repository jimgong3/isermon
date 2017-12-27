//
//  Global.swift
//  isermon
//
//  Created by jim on 26/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import Foundation

class Me {
    static let sharedInstance = Me()
    var username: String?
    var email: String?
    
    var liked_sermon_ids: Set<String>?
    var bookmarked_sermon_ids: Set<String>?
}

var selectedTabIndex = 0    //Latest

