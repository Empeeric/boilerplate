#include "stdafx.h"
#include <stdio.h>
#include "Account.h"



int ManageAccount(Account* MyAccount );
DWORD dwThreadId;
extern DWORD WINAPI ComserverThread(LPVOID lpvParam);

Account MyAccount;

int _tmain(int argc, _TCHAR* argv[])
{
	// Create ComServer thread
	HANDLE hThread = CreateThread( 
            NULL,              // no security attribute 
            0,                 // default stack size 
            ComserverThread,    // thread proc
            NULL,    // thread parameter 
            0,                 // not suspended 
            &dwThreadId);      // returns thread ID 

	Sleep(100);
	
	

	ManageAccount( &MyAccount );

	return 0;
}

void PrintMainMenu()
{
	printf("\n\nMenu:\n");
	printf("Press 'O' for openning a new account\n");
	printf("Press 'D' for deposit money\n");
	printf("Press 'S' for account status\n");
	printf("Press 'P' for Portfolio status\n");
	printf("Press 'Q' to quite\n");
	printf("\n");

	return;
}


int ManageAccount( Account* MyAccount )
{
	//
	// Temp! this code is temporary for emulating account managment
	//
	char c = 0;

	do
	{
		int NumOfProductsInPortfolio = MyAccount->GetNumberOfProductsInPortfolio();

		if ( c != '\n' )
		{
			PrintMainMenu();
		}
		//scanf_s("%c",&c);
		c = getchar();

		switch (c)
		{
		case 'D':
			int Amount;
			printf("Enter Amount:");
			scanf_s("%d",&Amount);
			MyAccount->Deposit((double)Amount);
			break;
		case 'S':
			printf("Total Funding:%1.2lf\n", MyAccount->Fund);
			printf("Cash:%1.2lf\n", MyAccount->Cash);
			printf("InvestedCapital:%1.2lf\n", MyAccount->InvestedMarketValue);
			printf("Balance:%1.2lf\n", MyAccount->Balance);
			printf("Profit:%1.2lf\n", MyAccount->Profit);
			break;
		case 'P':
			printf("List of Positions:\n");
			MyAccount->UpdatePortfolioValue();
			Product ProductTemp;
			for (int i=0; i<NumOfProductsInPortfolio; i++)
			{
				MyAccount->GetProdctByIndex(i, &ProductTemp);
				printf("Product Name:%s\n", ProductTemp.ProductName);
				printf("Product Invested Capital:%1.2lf\n", ProductTemp.Capital);
				printf("Product Market Value:%1.2lf\n", ProductTemp.MarketValue);
			}
			break;
		}

	} while (c != 'Q');

	return 0;
}		


